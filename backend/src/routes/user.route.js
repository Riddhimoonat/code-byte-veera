import express from "express";
import {
  register,
  userLoginControllers,
  getMe,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", userLoginControllers);
router.get("/me", authMiddleware, getMe);

export default router;