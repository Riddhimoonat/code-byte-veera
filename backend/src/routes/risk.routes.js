import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { getRiskScoreHandler } from '../controller/risk.controller.js';

const router = Router();

router.post('/', authMiddleware, getRiskScoreHandler);

export default router;
