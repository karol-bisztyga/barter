import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getMatches, unmatch, updateMatchMatchingItem } from '../controllers/matchController';

const router = Router();

router.put('/matches', authMiddleware, updateMatchMatchingItem);
router.get('/matches', authMiddleware, getMatches);
router.delete('/matches', authMiddleware, unmatch);

export default router;
