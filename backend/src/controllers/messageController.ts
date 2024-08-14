import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getMessages as getMessagesFromDatabase } from '../socketServer/databaseOperations';

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { matchId, offset, limit } = req.query;
    const messages = await getMessagesFromDatabase(
      matchId as string,
      offset as string,
      limit as string
    );
    res.json(messages);
  } catch (err) {
    res.status(500).send({ message: 'Server error: ' + err });
  }
};
