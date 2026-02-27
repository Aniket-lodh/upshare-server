import { Post } from "../models/post_model.js";
import { user as User } from "../models/user_model.js";
import catchAsync from "../utils/catchAsync.js";
import ServeError from "../utils/ServeError.js";
import streamifier from "streamifier";
import cloudinary from "../utils/cloudinary.js";
import { upload } from "../utils/uploadMemory.js";

export const createPost = catchAsync(async (req, res, next) => {
  upload(req, res, async function (err) {
    if (err) return next(err);

    if (!req.files || req.files.length === 0) {
      return next(
        new ServeError("An image is required to create a post.", 400)
      );
    }

    const file = req.files[0];

    const uploadToCloudinary = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `upshare/posts/${req.user._id}`,
            transformation: [{ width: 1200, crop: "limit" }],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      });

    const result = await uploadToCloudinary();

    const { caption, tags } = req.body;

    const parsedTags = tags ? tags.split(",").map((tag) => tag.trim()) : [];

    const newPost = await Post.create({
      caption,
      image: result.secure_url,
      tags: parsedTags,
      author: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: newPost,
    });
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

  await post.deleteOne();

  res.status(204).json({
    status: "success",
    data: null,
  });
});
