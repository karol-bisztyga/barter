import { Router } from 'express';
import {
  changePassword,
  updateProfilePicture,
  updateUser,
  deleteUser,
  updateOnboarded,
} from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.put('/user', authMiddleware, updateUser);
router.delete('/user', authMiddleware, deleteUser);
router.put('/user/password', authMiddleware, changePassword);
router.put('/user/onboarded', authMiddleware, updateOnboarded);
router.put('/user/profile_picture', authMiddleware, updateProfilePicture);

export default router;
