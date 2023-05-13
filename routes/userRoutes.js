import express from "express";
import {
  getAllUsers,
  createUser,
  loginUser,
} from "../controllers/user_controller.js";
import profileRoutes from "./userProfileRoutes.js";

const router = express.Router();

// All the available user routes
router.route("/").get(getAllUsers);

router.route("/signup").post(createUser); //Signup user

router.route("/login").post(loginUser); //Signin user

router.use("/profile", profileRoutes); //Profile routes


export default router;
