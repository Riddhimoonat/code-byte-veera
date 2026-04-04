import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { getRiskScoreHandler, getRiskMapHandler, findNearestStationsHandler } from '../controller/risk.controller.js';

const router = Router();

// 🛠️ TIC PRESENTATION MODE: Risk assessment is decoupled from hard auth 
// to ensure the Radar & ML always work during the demo/presentation.
router.post('/', (req, res) => getRiskScoreHandler(req, res));
router.post('/map', (req, res) => getRiskMapHandler(req, res));

router.post('/nearest-stations', authMiddleware, findNearestStationsHandler);

export default router;
