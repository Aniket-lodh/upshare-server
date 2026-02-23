import express from "express";
import { protect } from "../controllers/authController.js";
import {
  getProfile,
  getUser,
  updateProfile,
  followUser,
  unFollowUser,
  updateProfileImage,
} from "../controllers/user_controller.js";

const router = express.Router();

router
  .route("/upload")
  .patch(protect, updateProfileImage);

router.route("/me").get(protect, getProfile);

router.route("/edit").patch(protect, updateProfile);

router.route("/follow/:id").post(protect, followUser);
router.route("/unfollow/:id").post(protect, unFollowUser);

router.route("/:id").get(getUser);

export default router;
