import multer from "multer";
import ServeError from "./ServeError.js";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB (reduce from 10MB)
  },
  fileFilter: (req, file, callback) => {
    const allowed = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

    if (allowed.includes(file.mimetype)) {
      callback(null, true);
    } else {
      const err = new ServeError(
        "Only png, jpg, jpeg, webp formats allowed",
        400
      );
      err.name = "ExtensionError";
      callback(err);
    }
  },
}).array("images", 2);
