import { ObjectId } from "mongodb";
import { user as UserModule, user } from "../models/user_model.js";
import CatchAsync from "../utils/catchAsync.js";
import ServeError from "../utils/ServeError.js";
import { CreateJwtToken, createAccessToken } from "./authController.js";
import { upload } from "../utils/MulterStorage.js";

/**
 * Get all available users from the database
 * @returns available users if exists in the database else err message.
 **/
export const getAllUsers = CatchAsync(async (req, res, next) => {
  const users = await UserModule.find();
  if (!users) return next(new ServeError("No users record found.", 400));

  res.status(200).send({
    status: 200,
    message: "Successfully retreived records.",
    data: users,
  });
});

export const getUser = CatchAsync(async (req, res, next) => {
  const user_profile = await UserModule.findById(req.params.id);
  if (!user_profile)
    return next(new ServeError("The user doesnot exist.", 401));
  user_profile.__v = undefined;

  res.status(200).send({
    status: 200,
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
    res.status(200).send({
      status: 200,
      message: "Profile found successfully",
      data: req.user,
    });
  } catch (err) {
    res.status(500).send({ status: 500, message: err.message, data: null });
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
export const updateProfileImage = CatchAsync(async (req, res, next) => {
  if (req.files && req.files.length >= 1) {
    const url = [];
    req.files.map((file, i) => {
      url.push(
        `${req.protocol}://${req.hostname}/upload/users/${req.user.id}/${file.filename}`
      );
    });
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
      res.status(200).send({
        status: "success",
        code: 200,
        message: "Profile updated Successfully",
      });
    } else {
      return next(new ServeError("Problem Uploading data", 500));
    }
  }
});

export const updateProfile = CatchAsync(async (req, res, next) => {
  const user = await UserModule.findById(req.user._id);
  if (user) {
    const updatedProfile = await user.updateOne({
      $set: {
        ...req.body,
        location: `${req.body.country}, ${req.body.state}`,
      },
    });
    if (updatedProfile) createAccessToken(req.user, res, 201);
    else
      return next(
        new ServeError("Couldnot update profile. Please try again later!", 500)
      );
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
    await res.user.remove();
    res
      .status(200)
      .send({ status: 200, message: "Successfully removed", data: null });
  } catch (err) {
    res.status(500).send({ status: 500, message: err.message, data: null });
  }
};

export const followUser = CatchAsync(async (req, res, next) => {
  // TODO: work on not storing the user id if it already exists
  const user = await UserModule.findByIdAndUpdate(
    { _id: req.params.id, followers: { _id: { $ne: req.user._id } } },
    { $push: { followers: { _id: req.user._id } } },
    { new: true }
  );
  if (!user) {
    return next(new ServeError("The following user no longer exists!", 500));
  }
  const curUser = await UserModule.findByIdAndUpdate(
    { _id: req.user._id, following: { _id: { $ne: user._id } } },
    { $push: { following: { _id: user._id } } },
    { new: true }
  );

  res.send(curUser);
});
