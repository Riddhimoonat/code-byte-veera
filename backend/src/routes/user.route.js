import express from "express";
import {
  register,
  userLoginControllers,
  getMe,
<<<<<<< HEAD
  logout,
=======
>>>>>>> 556c257d73276443a0a738a543b1d15a504f7202
} from "../controller/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", userLoginControllers);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);

export default router;