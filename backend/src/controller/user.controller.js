import UserModel from "../models/auth.model.js";
import jwt from "jsonwebtoken";

export async function register(req, res) {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        message: "Name and phone are required",
      });
    }

    const user = await UserModel.findOne({ phone });

    if (user) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const newUser = await UserModel.create({
      name,
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
        phone: newUser.phone,
      },
      token
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
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        message: "Phone number is required",
      });
    }

    let user = await UserModel.findOne({ phone });

    // If user doesn't exist, create one automatically for demo
    if (!user) {
      user = await UserModel.create({
        name: 'Admin User',
        phone: phone,
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
      },
      token
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
    const user = await UserModel.findById(req.userId);

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

/** Clears the httpOnly JWT cookie set on register/login (same options as res.cookie). */
export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log("LOGOUT ERROR 👉", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};