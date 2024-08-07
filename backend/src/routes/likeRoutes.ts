import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { addLike } from '../controllers/likeController';

const router = Router();

router.post('/likes', authMiddleware, addLike);

export default router;
