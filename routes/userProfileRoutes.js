import express from "express";
import { param } from "express-validator";
import { validate } from "../middleware/validate.js";
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

router.route("/upload").patch(protect, updateProfileImage);

router.route("/me").get(protect, getProfile);

router.route("/edit").patch(protect, updateProfile);

router
  .route("/follow/:id")
  .post(
    protect,
    param("id").isMongoId().withMessage("Invalid user ID"),
    validate,
    followUser
  );

router
  .route("/unfollow/:id")
  .post(
    protect,
    param("id").isMongoId().withMessage("Invalid user ID"),
    validate,
    unFollowUser
  );

router.route("/:id").get(getUser);

export default router;
