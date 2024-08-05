import { AuthRequest } from './middlewares/authMiddleware';

export const getUserIdFromRequest = (req: AuthRequest): number => {
  if (!req.user) {
    throw new Error('User not found in request');
  }
  return req.user.id;
};
