import jwt from 'jsonwebtoken';
import UserModel from '../models/auth.model.js';

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Support both Web (cookies) and Mobile (Bearer headers)
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];

    if (!token) {
      console.log('[AUTH] No token provided in headers or cookies.');
      return res.status(401).json({
        message: 'No security token provided. Please log in.',
      });
    }

    // Use JWT_SECRET from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-veera-guard-2026-xyz');
    
    // Check if user still exists
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User account no longer exists.' });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    console.log('❌ [AUTH MIDDLEWARE ERROR] 👉', error.message);
    return res.status(401).json({
      message: 'Invalid or expired security token.',
    });
  }
};

export default authMiddleware;