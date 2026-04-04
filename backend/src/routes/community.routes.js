import express from 'express';
import { createReportHandler, getNearReportsHandler } from '../controller/community.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Publicly visible but requires auth to post
router.post('/report', authenticate, createReportHandler);
router.get('/nearby', getNearReportsHandler);

export default router;
