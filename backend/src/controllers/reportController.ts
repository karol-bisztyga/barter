import { Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getUserIdFromRequest } from '../utils';

export const createReport = async (req: AuthRequest, res: Response) => {
  const { reportedItemId, reason } = req.body;
  try {
    const userId = getUserIdFromRequest(req);

    const itemResult = await pool.query(
      'INSERT INTO reports (reporter_user_id, reported_item_id, reason) VALUES ($1, $2, $3) RETURNING *',
      [userId, reportedItemId, reason]
    );

    const result = itemResult.rows[0];

    res.json(result);
  } catch (err) {
    res.status(500).send({ message: 'Server error: ' + err });
  }
};
