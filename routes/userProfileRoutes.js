import express from "express";
import { protect } from "../controllers/authController.js";
import { getProfile, getUser } from "../controllers/user_controller.js";

const router = express.Router();

router.route("/me").get(protect, getProfile);

router.route("/:id").get(getUser);

export default router;
