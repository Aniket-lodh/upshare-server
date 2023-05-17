import jwt from "jsonwebtoken";
import { promisify } from "util";
import { user as UserModule } from "../models/user_model.js";
import ServeError from "../utils/ServeError.js";
import catchAsync from "../utils/catchAsync.js";

//FIXME: Delete this function
export const createAccessToken = async function (user) {
  const id = { _id: user._id };
  const accessToken = jwt.sign(id, process.env.TOKEN_SECRET);
  return accessToken;
};

const signJwtToken = async function (id) {
  const token = jwt.sign({ id }, process.env.TOKEN_SECRET, {
    algorithm: "HS512",
    expiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
  });
  return token;
};
export const CreateJwtToken = async function (user, res, statusCode) {
  //Sign the JWT token
  const jwt = await signJwtToken(user._id);
  const cookieOptions = {
    expire: new Date(Date.now() + process.env.COOKIE_EXPIRES_IN * 60 * 1000),
    httponly: true,
    secure: true,
    sameSite: "none",
  };
  // Sets the origin of the website which will be access credentials
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Accept"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);

  res.cookie("token", jwt, cookieOptions); //Stores token in cookie

  res
    .status(statusCode)
    .send({ status: "success", code: statusCode, data: { user } });
};

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.cookies.token) token = req.cookies.token;
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  )
    token = await req.headers.authorization.split(" ")[1];
  // console.log(token);
  if (!token)
    return next(new ServeError("Session expired! please log in again.", 401));
  const decode_token = jwt.verify(token, process.env.TOKEN_SECRET, {
    algorithm: "HS512",
  });
  const user = await UserModule.findById(decode_token.id);

  if (!user) return next(new ServeError("The user doesnot exist.", 401));

  req.user = user; //passing the user object so that next routes can access this
  next();
});

export const verifyToken = async (req, res, next) => {
  const bearerToken = await req.headers["authorization"];
  if (bearerToken) {
    const token = bearerToken.split(" ")[1];
    res.token = token;
    next();
  } else {
    res.status(403).send({
      status: 403,
      message: "User isn't logged in or Invalid credentials.",
      data: null,
    });
  }
};
export const verifyUser = async (req, res, next) => {
  try {
    const user = await promisify(jwt.verify)(
      res.token,
      process.env.TOKEN_SECRET
    );

    const userObj = await UserModule.findById(user);
    if (!userObj)
      return res
        .status(404)
        .send({ status: 400, message: "User doesn't exist" });
    res.user = userObj;
    next();
  } catch (err) {
    return res.status(500).send({ status: 500, message: err.message });
  }
};
