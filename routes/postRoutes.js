import express from "express";
import { param, body, validationResult } from "express-validator";
import { protect } from "../controllers/authController.js";
import {
  createPost,
  getFeed,
  getPost,
  likePost,
  unlikePost,
  deletePost,
  uploadPostImage,
  commentOnPost,
} from "../controllers/post_controller.js";

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      data: errors.array(),
    });
  }
  next();
};

const validateId = [
  param("id").isMongoId().withMessage("Invalid Post ID"),
  validate,
];

router
  .route("/")
  .post(
    protect,
    uploadPostImage,
    body("caption")
      .isLength({ max: 500 })
      .withMessage("Caption cannot exceed 500 characters"),
    validate,
    createPost
  );

router.route("/feed").get(getFeed);

router
  .route("/:id")
  .get(validateId, getPost)
  .delete(protect, validateId, deletePost);

router.route("/:id/like").post(protect, validateId, likePost);

router.route("/:id/unlike").post(protect, validateId, unlikePost);

router
  .route("/:id/comment")
  .post(
    protect,
    validateId,
    body("text")
      .notEmpty()
      .withMessage("Text is required")
      .isLength({ max: 300 })
      .withMessage("Text too long"),
    validate,
    commentOnPost
  );

export default router;
