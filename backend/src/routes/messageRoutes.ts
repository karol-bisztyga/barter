import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getMessages } from '../controllers/messageController';

const router = Router();

router.get('/messages', authMiddleware, getMessages);

export default router;
