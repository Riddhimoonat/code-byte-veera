import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { triggerSOS } from '../controller/sos.controller.js';

const router = Router();

router.post('/', authMiddleware, triggerSOS);

export default router;
