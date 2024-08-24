import { Router } from 'express';
import { changePassword, updateUser } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.put('/user', authMiddleware, updateUser);
router.put('/user/password', authMiddleware, changePassword);

export default router;
