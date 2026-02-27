import express from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import {
  getAllUsers,
  createUser,
  loginUser,
} from "../controllers/user_controller.js";
import { protect, logoutUser } from "../controllers/authController.js";
import profileRoutes from "./userProfileRoutes.js";

const router = express.Router();

// All the available user routes
router.route("/").get(getAllUsers);

router.route("/signup").post(
  [
    body("name")
      .trim()
      .isLength({ min: 6, max: 30 })
      .withMessage("Name must be between 6 and 30 characters"),

    body("email").isEmail().withMessage("Valid email required"),

    body("passcode")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),

    body("passcodeConfirm").custom((value, { req }) => {
      if (value !== req.body.passcode) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
  validate,
  createUser
); //Signup user

router
  .route("/login")
  .post(
    [
      body("email").isEmail().withMessage("Valid email required"),

      body("passcode").notEmpty().withMessage("Password required"),
    ],
    validate,
    loginUser
  ); //Signin user

router.route("/logout").post(protect, logoutUser); //Logout user

router.use("/profile", profileRoutes); //Profile routes

export default router;
