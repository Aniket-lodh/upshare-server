import multer from "multer";
import fs from "fs";
import path from "path";
import ServeError from "./ServeError.js";

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    const dir = `./public/upload/posts/${req.user._id}`;

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    callback(null, dir);
  },
  filename: function (req, file, callback) {
    const sanitized = path.basename(file.originalname);
    const filename = Date.now() + "-" + sanitized;
    callback(null, filename);
  },
});

export const postUpload = multer({
  storage: storage,
  fileFilter: (req, file, callback) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/webp"
    ) {
      callback(null, true);
    } else {
      callback(null, false);
      const err = new ServeError(
        "Only .png, .jpg, .jpeg, .webp formats are allowed!",
        400
      );
      err.name = "ExtensionError";
      return callback(err);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});
