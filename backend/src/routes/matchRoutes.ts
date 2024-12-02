import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  unmatch,
  updateMatchMatchingItem,
  updateMatchNotified,
} from '../controllers/matchController';

const router = Router();

router.put('/matches', authMiddleware, updateMatchMatchingItem);
router.put('/matches/notified', authMiddleware, updateMatchNotified);
router.delete('/matches', authMiddleware, unmatch);

export default router;
