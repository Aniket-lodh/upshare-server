import jwt from "jsonwebtoken";
import { promisify } from "util";
import { user as UserModule } from "../models/user_model.js";
import ServeError from "../utils/ServeError.js";
import catchAsync from "../utils/catchAsync.js";

const signJwtToken = async function (id) {
  const token = jwt.sign({ id }, process.env.TOKEN_SECRET, {
    algorithm: "HS512",
    expiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
  });
  return token;
};

export const CreateJwtToken = async function (user, res, statusCode) {
  //Sign the JWT token
  const token = await signJwtToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + parseInt(process.env.COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };
  // Re-fetch full user profile with all fields for the frontend
  const fullUser = await UserModule.findById(user._id).select(
    "+username +bio +profession +website +email +phone +gender +country +state +location +followers +following +likes"
  );

  res.cookie("token", token, cookieOptions); //Stores token in cookie
  res.status(statusCode).json({
    success: true,
    message:
      statusCode === 201
        ? "Account created successfully"
        : "Logged in successfully",
    data: fullUser,
  });
};

export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ServeError("Authentication required", 401));
  }

  const decoded = jwt.verify(token, process.env.TOKEN_SECRET, {
    algorithms: ["HS512"],
  });

  const currentUser = await UserModule.findById(decoded.id);

  if (!currentUser) {
    return next(new ServeError("User no longer exists", 401));
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new ServeError("Password recently changed. Please log in again.", 401)
    );
  }

  req.user = currentUser;
  next();
});

export const logoutUser = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    expires: new Date(0), // Expire immediately
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
