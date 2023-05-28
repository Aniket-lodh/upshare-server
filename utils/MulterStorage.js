import multer from "multer";
import fs from "file-system";
import ServeError from "./ServeError.js";

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    const dir = `./public/upload/users/${req.user.id}`;

    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    callback(null, dir);
  },
  filename: function (req, file, callback) {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");

    callback(null, fileName);
  },
});

export const upload = multer({
  storage: storage,
  fileFilter: (req, file, callback) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      callback(null, true);
    } else {
      callback(null, false);
      return callback(
        new ServeError("Only .png, .jpg, .jpeg format are allowed!", 500)
      );
    }
  },
  limit: {
    fileSize: 52428800,
  },
});
