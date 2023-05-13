import { ObjectId } from "mongodb";
import { user as UserModule } from "../models/user_model.js";
import getErrors from "../utils/elog.js";
import { createAccessToken } from "./authController.js";
import CatchAsync from "../utils/catchAsync.js";
import ServeError from "../utils/ServeError.js";
import { CreateJwtToken } from "./authController.js";
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
  user_profile.__v=undefined;
  
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
export const updateUser = async (req, res) => {
  if (JSON.stringify(req.params.id) !== JSON.stringify(res.user._id)) {
    return res
      .status(401)
      .send({ status: 401, message: "Invalid user", data: null });
  }

  req.body.username ? (res.user.username = req.body.username) : "";
  req.body.gender ? (res.user.gender = req.body.gender) : "";
  req.body.email ? (res.user.email = req.body.email) : "";
  req.body.phone ? (res.user.phone = req.body.phone) : "";
  req.body.passcode ? (res.user.passcode = req.body.passcode) : "";
  req.body.address ? (res.user.address = req.body.address) : "";

  res.user.updatedAt = new Date();
  try {
    await res.user.save(function (error, _document) {
      //check for errors
      let resp = getErrors(error);
      //Send Errors to browser
      resp.status === 200 ? (resp._id = _document._id) : "";
      resp.status === 200
        ? (resp.message = "No Errors found, Updated successfully")
        : resp.message;
      res.status(resp.status).send(resp);
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

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
