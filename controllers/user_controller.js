import { ObjectId } from "mongodb";
import { user as UserModule, user } from "../models/user_model.js";
import { Post } from "../models/post_model.js";
import CatchAsync from "../utils/catchAsync.js";
import ServeError from "../utils/ServeError.js";
import { CreateJwtToken } from "./authController.js";
import { upload } from "../utils/MulterStorage.js";
import multer from "multer";

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
  const user_profile = await UserModule.findById(req.params.id);
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
    res.status(200).json({
      status: "success",
      message: "Profile found successfully",
      data: req.user,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message, data: null });
  }
};

export const loginUser = CatchAsync(async (req, res, next) => {
  const { email, passcode } = req.body;
  // 1) Check if email and password is empty
  if (!email || !passcode)
    return next(new ServeError("Please provide email and password!", 400));
  else if (email === passcode)
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
    if (err instanceof multer.MulterError) {
      //A multer error occurred when uploading.
      return next(new ServeError("Multer Error Uploading.", 500));
    } else if (err) {
      // An unknown error occurred when uploading.
      if (err.name == "ExtensionError") {
        return next(new ServeError(err.message, 413));
      } else {
        return next(
          new ServeError(`Unknown uploading error: ${err.message}`, 500)
        );
      }
    }
    // console.log(req);
    if (req.files && req.files.length >= 1) {
      const url = [];
      req.files.map((file, i) => {
        url.push(
          `${req.protocol}://${req.hostname}/upload/users/${req.user.id}/${file.filename}`
        );
      });
      // console.log(url);

      const user = await UserModule.findByIdAndUpdate(
        {
          _id: req.user._id,
        },
        {
          $set: {
            profilephoto: url[0],
            coverphoto: url[1],
          },
        },
        { new: true }
      );
      if (user) {
        // console.log(url);
        // console.log(user);
        res.status(200).json({
          status: "success",
          
          message: "Image successfully uploaded.",
        });
      } else {
        return next(new ServeError("Problem Uploading data", 500));
      }
    } else {
      res.status(200).json({
        status: "success",
        
        message: "No Image uploaded.",
      });
    }
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
