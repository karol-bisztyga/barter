import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { createReport } from '../controllers/reportController';

const router = Router();

router.post('/reports', authMiddleware, createReport);

export default router;
