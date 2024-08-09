import { Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';

export const updateMatchMatchingItem = async (req: AuthRequest, res: Response) => {
  const { newMatchingItemId, matchingItemId, matchedItemId } = req.body;
  try {
    console.log('updating match matching item', newMatchingItemId, matchingItemId, matchedItemId);

    const queryResult = await pool.query(
      'UPDATE matches SET matching_item_id = $1 WHERE matching_item_id = $2 AND matched_item_id = $3 RETURNING *',
      [newMatchingItemId, matchingItemId, matchedItemId]
    );
    const updateResult = queryResult.rows[0];

    res.json({
      result: updateResult,
    });
  } catch (err) {
    res.status(500).send({ message: 'Server error: ' + err });
  }
};
