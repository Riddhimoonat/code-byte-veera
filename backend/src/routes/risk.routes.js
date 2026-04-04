import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { getRiskScoreHandler, getRiskMapHandler, findNearestStationsHandler } from '../controller/risk.controller.js';

const router = Router();

router.post('/', authMiddleware, getRiskScoreHandler);
router.post('/map', authMiddleware, getRiskMapHandler);
router.post('/nearest-stations', authMiddleware, findNearestStationsHandler);

export default router;
