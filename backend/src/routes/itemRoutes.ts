import { Router } from 'express';
import {
  createItem,
  getUserItems,
  updateItem,
  deleteItem,
  getItemsForCards,
} from '../controllers/itemController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/items', authMiddleware, createItem);
router.get('/items', authMiddleware, getUserItems);
router.put('/items/:id', authMiddleware, updateItem);
router.delete('/items/:id', authMiddleware, deleteItem);

router.get('/cards', authMiddleware, getItemsForCards);

export default router;
