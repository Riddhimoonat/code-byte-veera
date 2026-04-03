import UserModel from "../models/auth.model.js";
import jwt from "jsonwebtoken";
import { genSalt, hash, compare } from "bcrypt";

export async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const user = await UserModel.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: false,
      sameSite: "lax",
    });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.log("REGISTER ERROR 👉", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export const userLoginControllers = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const comparePass = await compare(password, user.password);

    if (!comparePass) {
      return res.status(401).json({
        message: "Password not matched",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days — matches JWT expiry
      secure: false,
      sameSite: "lax",
    });

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      message: "User logged in successfully",
      user: userObj,
    });
  } catch (error) {
    console.log("LOGIN ERROR 👉", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Current user fetched successfully",
      user,
    });
  } catch (error) {
    console.log("GET ME ERROR 👉", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};