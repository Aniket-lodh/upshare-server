import { ObjectId } from "mongodb";
import { user as UserModule, user } from "../models/user_model.js";
import { Post } from "../models/post_model.js";
import CatchAsync from "../utils/catchAsync.js";
import ServeError from "../utils/ServeError.js";
import { CreateJwtToken } from "./authController.js";
import { upload } from "../utils/uploadMemory.js";
import cloudinary from "../utils/cloudinary.js";
import multer from "multer";
import streamifier from "streamifier";

/**
 * Get all available users from the database
 * @returns available users if exists in the database else err message.
 **/
export const getAllUsers = CatchAsync(async (req, res, next) => {
  const users = await UserModule.find();
  if (!users) return next(new ServeError("No users record found.", 400));

  res.status(200).json({
    status: "success",
    message: "Successfully retreived records.",
    data: users,
  });
});

export const getUser = CatchAsync(async (req, res, next) => {
  const user_profile = await UserModule.findById(req.params.id).select(
    "+username +bio +profession +website +email +phone +gender +country +state +location +followers +following +likes"
  );
  if (!user_profile)
    return next(new ServeError("The user doesnot exist.", 401));
  user_profile.__v = undefined;

  res.status(200).json({
    status: "success",
    message: "User profile found",
    data: user_profile,
  });
});
/**
 * Get user profile from the database
 * @param req.user passed from middleware
 * @returns exisiting user if exists in the database else err message.
 **/
export const getProfile = async (req, res, next) => {
  try {
    const fullUser = await UserModule.findById(req.user._id).select(
      "+username +bio +profession +website +email +phone +gender +country +state +location +followers +following +likes"
    );
    res.status(200).json({
      success: true,
      message: "Profile found successfully",
      data: fullUser,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message, data: null });
  }
};

export const loginUser = CatchAsync(async (req, res, next) => {
  const { email, passcode } = req.body;
  if (email === passcode)
    return next(new ServeError("Password cannot contain email.", 400));
  const user = await UserModule.findOne({ email }).select("+passcode");

  // 2) Check if user exists && password is incorrect
  if (!user) return next(new ServeError("No Account found", 400));
  else if (!(await user.correctPassword(passcode, user.passcode)))
    //TODO: work on the userSchema method
    return next(new ServeError("Email or Password is invalid.", 401));
  user.passcode = undefined;
  CreateJwtToken(user, res, 200);
});

/**
 * creates an user
 * @param req.body
 * @returns an Access token of the user.
 **/
export const createUser = CatchAsync(async (req, res, next) => {
  if (req.body.email === req.body.passcode) {
    return next(new ServeError("Password cannot contain email address.", 400));
  }
  const user = await UserModule.create({
    name: req.body.name,
    email: req.body.email,
    passcode: req.body.passcode,
    passcodeConfirm: req.body.passcodeConfirm,
  });

  user.passcode = undefined;
  user.__v = undefined;

  CreateJwtToken(user, res, 201);
});

/**
 * udpates an user
 * @param req.params.id for verification match if the given id and the token id matches or not
 * @returns id of the user.
 **/
// TODO: FIX the edit section part, where it gets stuck
export const updateProfileImage = CatchAsync(async (req, res, next) => {
  upload(req, res, async function (err) {
    if (err) return next(err);

    if (!req.files || req.files.length === 0) {
      return next(new ServeError("No images uploaded", 400));
    }

    const uploadedUrls = [];

    for (const file of req.files) {
      const uploadToCloudinary = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: `upshare/users/${req.user._id}`,
              transformation: [{ width: 800, crop: "limit" }],
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );

          streamifier.createReadStream(file.buffer).pipe(stream);
        });

      const result = await uploadToCloudinary();
      uploadedUrls.push(result.secure_url);
    }

    const updatedUser = await UserModule.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          profilephoto: uploadedUrls[0] || "",
          coverphoto: uploadedUrls[1] || "",
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      data: {
        profilephoto: updatedUser.profilephoto,
        coverphoto: updatedUser.coverphoto,
      },
    });
  });
});

export const updateProfile = CatchAsync(async (req, res, next) => {
  // TODO: FIX only update the fields that was actually edited.
  const user = await UserModule.findById(req.user._id);
  if (user) {
    const updatedProfile = await user.updateOne({
      $set: {
        ...req.body,
        location: `${req.body.country}, ${req.body.state}`,
      },
    });
    if (updatedProfile) {
      res.status(200).json({
        status: "success",

        message: "Profile Update Successfully",
      });
    } else {
      console.log("err in profile update");
      // console.log(updatedProfile);
      return next(
        new ServeError("Couldnot update profile. Please try again later!", 500)
      );
    }
  } else {
    return next(new ServeError("The user doesnot exist", 404));
  }
});

/**
 * deletes an user
 * @param token Bearer token
 * @returns Successful response
 **/
export const deleteUser = async (req, res) => {
  try {
    // Cascade delete user's posts
    const userId = req.user._id;
    await Post.deleteMany({ author: userId });

    // Actually delete user
    await req.user.deleteOne();

    res
      .status(200)
      .json({ status: "success", message: "Successfully removed", data: null });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message, data: null });
  }
};

export const followUser = CatchAsync(async (req, res, next) => {
  // console.log(req.params, req.user);
  if (req.user._id.toString() === req.params.id)
    return next(new ServeError("You cannot follow yourself", 403));

  const FindUser = await UserModule.findById({
    _id: req.params.id,
  });
  if (!FindUser) {
    return next(new ServeError("The following user no longer exists!", 404));
  }
  if (FindUser.followers.indexOf(req.user._id) >= 0) {
    return next(new ServeError("Already Following the user.", 409));
  }
  const updateFollowedUser = await FindUser.updateOne({
    $push: {
      followers: req.user._id,
    },
  });
  const updateFolloweeUser = await UserModule.findByIdAndUpdate(
    { _id: req.user._id },
    {
      $push: {
        following: req.params.id,
      },
    }
  );
  if (updateFollowedUser && updateFolloweeUser) {
    res.status(200).json({
      status: "success",

      message: "Started Following the user.",
    });
  }
});

export const unFollowUser = CatchAsync(async (req, res, next) => {
  // console.log(req.params, req.user);
  if (req.user._id.toString() === req.params.id)
    return next(new ServeError("You cannot unfollow yourself", 403));

  const FindUser = await UserModule.findById({
    _id: req.params.id,
  });
  if (!FindUser) {
    return next(new ServeError("The following user no longer exists!", 404));
  }
  if (FindUser.followers.indexOf(req.user._id) < 0) {
    return next(new ServeError("Already unfollowed the user.", 409));
  }
  const updateUnFollowedUser = await FindUser.updateOne({
    $pull: {
      followers: req.user._id,
    },
  });
  const updateUnFolloweeUser = await UserModule.findByIdAndUpdate(
    { _id: req.user._id },
    {
      $pull: {
        following: req.params.id,
      },
    }
  );
  if (updateUnFollowedUser && updateUnFolloweeUser) {
    res.status(200).json({
      status: "success",

      message: "Unfollowed the user.",
    });
  }
});
