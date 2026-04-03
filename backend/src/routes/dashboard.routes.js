import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { getAlerts, updateAlertStatus, getStats } from '../controller/dashboard.controller.js';

const router = Router();

router.use(authMiddleware); // all dashboard routes need auth

router.get('/alerts', getAlerts);
router.patch('/alerts/:id', updateAlertStatus);
router.get('/stats', getStats);

export default router;
