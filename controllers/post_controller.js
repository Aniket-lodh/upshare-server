import { Post } from "../models/post_model.js";
import { user as User } from "../models/user_model.js";
import catchAsync from "../utils/catchAsync.js";
import ServeError from "../utils/ServeError.js";
import { postUpload } from "../utils/postUpload.js";
import multer from "multer";
import fs from "fs";
import path from "path";

export const uploadPostImage = (req, res, next) => {
  postUpload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return next(new ServeError(`Upload Error: ${err.message}`, 400));
    } else if (err) {
      return next(new ServeError(err.message, 400));
    }
    next();
  });
};

export const createPost = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new ServeError("An image is required to create a post.", 400));
  }

  const { caption, tags } = req.body;

  if (!caption) {
    return next(new ServeError("A caption is required.", 400));
  }

  // Generate relative URL for the uploaded image to prevent origin exposure
  const imageUrl = `/upload/posts/${req.user._id}/${req.file.filename}`;

  // Parse tags if sent as JSON string
  let parsedTags = [];
  if (tags) {
    try {
      parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
    } catch (e) {
      parsedTags =
        typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : [];
    }
  }

  const newPost = await Post.create({
    caption,
    image: imageUrl,
    tags: parsedTags,
    author: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: newPost,
  });
});

export const getFeed = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: "author",
      select: "name profilephoto username",
    })
    .select("-comments -updatedAt")
    .lean();

  const total = await Post.countDocuments();

  res.status(200).json({
    status: "success",
    results: posts.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data: posts,
  });
});

export const getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate({
      path: "author",
      select: "name profilephoto username",
    })
    .populate({
      path: "comments.user",
      select: "name profilephoto username",
    });

  if (!post) {
    return next(new ServeError("No post found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: post,
  });
});

export const likePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  ).select("likes");

  if (!post) {
    return next(new ServeError("No post found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Post liked",
    data: { likes: post.likes, likesCount: post.likes.length },
  });
});

export const unlikePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true }
  ).select("likes");

  if (!post) {
    return next(new ServeError("No post found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Post unliked",
    data: { likes: post.likes, likesCount: post.likes.length },
  });
});

export const commentOnPost = catchAsync(async (req, res, next) => {
  const { text } = req.body;
  if (!text) {
    return next(new ServeError("Comment text is required", 400));
  }

  const post = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        comments: {
          user: req.user._id,
          text,
          createdAt: Date.now(),
        },
      },
    },
    { new: true }
  ).populate({
    path: "comments.user",
    select: "name profilephoto username",
  });

  if (!post) {
    return next(new ServeError("No post found with that ID", 404));
  }

  res.status(201).json({
    status: "success",
    message: "Comment added",
    data: post,
  });
});

export const deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ServeError("No post found with that ID", 404));
  }

  // Ensure only author can delete
  if (post.author.toString() !== req.user._id.toString()) {
    return next(
      new ServeError("You don't have permission to delete this post", 403)
    );
  }

  // Remove image from disk
  if (post.image) {
    try {
      // image is a full URL: http://localhost:2408/upload/posts/user_id/filename.ext
      const urlParts = new URL(post.image);
      // pathname starts with /upload/..., map to ./public/upload/...
      const imagePath = path.join(
        process.cwd(),
        "public",
        decodeURI(urlParts.pathname)
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (err) {
      console.error("Failed to delete post image file:", err);
      // We log but do not fail the request if file is already gone
    }
  }

  await post.deleteOne();

  res.status(204).json({
    status: "success",
    data: null,
  });
});
