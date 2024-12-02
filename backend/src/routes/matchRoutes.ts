import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { unmatch, updateMatchMatchingItem } from '../controllers/matchController';

const router = Router();

router.put('/matches', authMiddleware, updateMatchMatchingItem);
router.get('/matches', authMiddleware);
router.delete('/matches', authMiddleware, unmatch);

export default router;
