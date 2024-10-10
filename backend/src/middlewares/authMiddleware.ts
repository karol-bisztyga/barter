import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export interface AuthRequest extends Request {
  user?: jwt.JwtPayload;
}

export const verifyToken = (token: string) => {
  const { JWT_SECRET } = process.env;
  if (!JWT_SECRET) {
    throw new Error('Missing jwt secret');
  }
  const decoded = jwt.verify(token, JWT_SECRET);
  if (typeof decoded === 'string') {
    throw new Error('Token validation failed');
  }
  return decoded;
};

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).send({ message: 'Access denied. No token provided' });
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch (ex) {
    res.status(400).send({ message: 'Invalid token' });
  }
};
