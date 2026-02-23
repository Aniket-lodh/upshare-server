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
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };
  // Sets the origin of the website which will be access credentials
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Accept"
  );

  res.cookie("token", token, cookieOptions); //Stores token in cookie
  res
    .status(statusCode)
    .send({ status: "success", code: statusCode, data: { jwt: token } });
};

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.cookies.token) token = req.cookies.token;
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  )
    token = req.headers.authorization.split(" ")[1];

  if (!token)
    return next(new ServeError("Session expired! please log in again.", 401));
  const decode_token = jwt.verify(token, process.env.TOKEN_SECRET, {
    algorithms: ["HS512"],
  });
  const user = await UserModule.findById(decode_token.id);

  if (!user) return next(new ServeError("The user doesnot exist.", 401));

  req.user = user; //passing the user object so that next routes can access this
  next();
});
