import express from "express";
import { protect } from "../controllers/authController.js";
import {
  getProfile,
  getUser,
  updateProfile,
  followUser,
  updateProfileImage,
} from "../controllers/user_controller.js";
import { upload } from "../utils/MulterStorage.js";

const router = express.Router();

router
  .route("/upload")
  .patch(protect, upload.array("images", 2), updateProfileImage);

router.route("/me").get(protect, getProfile);

router.route("/edit").patch(protect, updateProfile);

router.route("/follow/:id").post(protect, followUser);

router.route("/:id").get(getUser);

export default router;
