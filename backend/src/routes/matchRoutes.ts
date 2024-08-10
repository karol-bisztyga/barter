import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getMatches, updateMatchMatchingItem } from '../controllers/matchController';

const router = Router();

router.put('/matches', authMiddleware, updateMatchMatchingItem);
router.get('/matches', authMiddleware, getMatches);

export default router;
