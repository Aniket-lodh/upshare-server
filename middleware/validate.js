import { validationResult } from "express-validator";
import ServeError from "../utils/ServeError.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new ServeError(
        errors
          .array()
          .map((err) => err.msg)
          .join(", "),
        400
      )
    );
  }

  next();
};
