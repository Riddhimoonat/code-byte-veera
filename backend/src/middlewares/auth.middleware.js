import jwt from "jsonwebtoken";
import UserModel from "../models/auth.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // 🛡️ DEV BYPASS for TIC 2K26 presentation
    // Allows the app to function even if the JWT service is unreachable or using a mock token.
    if (authHeader === 'dev-bypass-token' || authHeader === 'Bearer dev-bypass-token') {
        console.warn('⚠️ [AUTH] Using DEV-BYPASS token. Security suspended for presentation.');
        const testUser = await UserModel.findOne({ phone: '7869221567' }); // Default to Mrinal for bypass
        if (testUser) {
          req.userId = testUser._id;
          return next();
        }
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[AUTH] No token provided in headers or cookies.");
      return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-veera-guard-2026-xyz');
      req.userId = decoded.id;
      next();
    } catch (err) {
      console.error("❌ [AUTH MIDDLEWARE ERROR] 👉", err.message);
      return res.status(401).json({ message: "Token is not valid" });
    }
  } catch (error) {
    console.error("❌ [AUTH MIDDLEWARE SYSTEM ERROR] 👉", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default authMiddleware;