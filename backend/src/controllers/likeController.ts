import { Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getUserIdFromRequest } from '../utils';

export const addLike = async (req: AuthRequest, res: Response) => {
  const { likedItemId, decision } = req.body;
  // const client = await pool.connect();
  try {
    // await client.query('BEGIN');
    console.log('posting like', likedItemId, decision);
    const userId = getUserIdFromRequest(req);

    const queryResult = await pool.query(
      'INSERT INTO likes (liker_id, liked_id, decision) VALUES ($1, $2, $3) RETURNING *',
      [userId, likedItemId, decision]
    );
    const result = queryResult.rows[0];

    // on successful like check for a match, if it matched, retrun the info about the new match and automatically create it in the db here
    // with a random (or least used) user item.
    // the user will see the screen where they will be able to switch the item with the one they like but we want to create a match right away
    // in case frontend crashes or user closes the app or whatever else

    res.json(result);
  } catch (err) {
    // await client.query('ROLLBACK');
    res.status(500).send({ message: 'Server error: ' + err });
  }
  // finally {
  //   client.release();
  // }
};
