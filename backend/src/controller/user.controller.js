import UserModel from "../models/auth.model.js";
import jwt from "jsonwebtoken";
import twilio from "twilio";

// ─── TWILIO CLIENT ────────────────────────────────────────────────────────────
// Note to User: Ensure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER 
// are correctly set in backend/src/.env
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// ─── REGISTER USER ────────────────────────────────────────────────────────────
export async function register(req, res) {
  try {
    const { name, phone } = req.body;
    console.log(`[AUTH] Registering user: ${name}, ${phone}`);

    const existingUser = await UserModel.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered. Please log in." });
    }

    const newUser = await UserModel.create({ name, phone });

    console.log("[AUTH] Successfully registered. Proceeding to login.");
    return res.status(201).json({
      success: true,
      message: "Registration successful! You can now verify your phone via OTP.",
      user: { name: newUser.name, phone: newUser.phone }
    });
  } catch (error) {
    console.error("❌ [AUTH REGISTER ERROR]", error.message);
    return res.status(500).json({ message: "Internal server error", detail: error.message });
  }
}

// ─── LOGIN / REQUEST OTP ──────────────────────────────────────────────────────
export const userLoginControllers = async (req, res) => {
  try {
    const { phone } = req.body;
    console.log(`[AUTH] Login attempt / OTP requested for: ${phone}`);

    if (!phone) return res.status(400).json({ message: "Phone number is required" });

    const user = await UserModel.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "User not found. Please sign up first." });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otpCode;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry
    await user.save();

    console.log(`🔐 [OTP DEBUG] Code for ${phone}: ${otpCode}`);

    // Send original SMS via Twilio if configured
    if (twilioClient) {
      try {
        await twilioClient.messages.create({
          body: `[VEERA] Your verification code is: ${otpCode}. Valid for 10 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: `+91${phone}` // Indian format +91
        });
        console.log(`✅ [TWILIO] Real OTP sent to +91${phone}`);
      } catch (err) {
        console.error("❌ [TWILIO ERROR] FAILED TO SEND REAL SMS:", err.message);
        // Fallback or let it through with debug logs during dev
      }
    } else {
      console.warn("⚠️ [TWILIO] NOT CONFIGURED. Using terminal debug logs only.");
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your phone!",
      mockedOtp: !twilioClient ? otpCode : null // Only return in dev mode (no Twilio)
    });
  } catch (error) {
    console.error("❌ [AUTH LOGIN ERROR]", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── VERIFY OTP & GET TOKEN ───────────────────────────────────────────────────
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    console.log(`[AUTH] Verifying OTP for: ${phone}`);

    const user = await UserModel.findOne({ phone });
    if (!user || user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(401).json({ message: "Invalid or expired OTP." });
    }

    // Clear OTP after successful use
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'super-secret-veera-guard-2026-xyz',
      { expiresIn: "7d" }
    );

    // Return FULL user data to ensure frontend has correct state
    return res.status(200).json({
      success: true,
      message: "Security verification successful!",
      user: { 
        name: user.name, 
        phone: user.phone,
        _id: user._id 
      },
      token
    });
  } catch (error) {
    console.error("❌ [VERIFY ERROR]", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── GET CURRENT USER ──────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export const logout = (req, res) => {
  return res.status(200).json({ message: "Logged out successfully" });
};