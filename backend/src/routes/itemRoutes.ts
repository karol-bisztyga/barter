import { Router } from 'express';
import { createItem, getItems, updateItem, deleteItem } from '../controllers/itemController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/items', authMiddleware, createItem);
router.get('/items', authMiddleware, getItems);
router.put('/items/:id', authMiddleware, updateItem);
router.delete('/items/:id', authMiddleware, deleteItem);

export default router;
