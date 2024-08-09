import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { updateMatchMatchingItem } from '../controllers/matchController';

const router = Router();

router.put('/matches', authMiddleware, updateMatchMatchingItem);

export default router;
