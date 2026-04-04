import express from "express";
import {
  register,
  userLoginControllers,
  verifyOtp,
  getMe,
  logout,
  toggleVolunteer,
  updateLocation,
} from "../controller/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", userLoginControllers);
router.post("/verify-otp", verifyOtp);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);
router.post("/toggle-volunteer", authMiddleware, toggleVolunteer);
router.post("/location", authMiddleware, updateLocation);

export default router;