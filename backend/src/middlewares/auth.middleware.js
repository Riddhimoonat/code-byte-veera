import jwt from 'jsonwebtoken';
import UserModel from '../models/auth.model.js';

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Support both Web (cookies) and Mobile (Bearer headers)
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];

    if (!token) {
      // 🚨 DEVELOPMENT BYPASS: Since the mobile app has no Login flow yet,
      // we auto-assign a test user so the SOS and ML features are not blocked.
      let testUser = await UserModel.findOne();
      if (!testUser) {
        testUser = await UserModel.create({
          name: 'Veera Tester',
          email: 'test@veera.app',
          password: 'dummy_password',
          phone: '+919999999999',
        });
      }
      req.userId = testUser._id.toString();
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.log('AUTH MIDDLEWARE ERROR 👉', error.message);
    return res.status(401).json({
      message: 'Invalid or expired token',
    });
  }
};

export default authMiddleware;