import { Router } from 'express';
import {
  createItem,
  getUserItems,
  updateItem,
  deleteItem,
  getItemsForCards,
  addImage,
  deleteImage,
} from '../controllers/itemController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/items', authMiddleware, createItem);
router.get('/items', authMiddleware, getUserItems);
router.put('/items/image', authMiddleware, addImage);
router.put('/items/:id', authMiddleware, updateItem);
router.delete('/items/image', authMiddleware, deleteImage);
router.delete('/items/:id', authMiddleware, deleteItem);

router.get('/cards', authMiddleware, getItemsForCards);

export default router;
