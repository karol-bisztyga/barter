import { Router } from 'express';
import { changePassword, updateProfilePicture, updateUser } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.put('/user', authMiddleware, updateUser);
router.put('/user/password', authMiddleware, changePassword);
router.put('/user/profile_picture', authMiddleware, updateProfilePicture);

export default router;
