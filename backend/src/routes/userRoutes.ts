import { Router } from 'express';
import { updateUser } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.put('/user', authMiddleware, updateUser);

export default router;
