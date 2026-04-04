import express from "express";
import {
  register,
  userLoginControllers,
  getMe,
  logout,
} from "../controller/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", userLoginControllers);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);

export default router;