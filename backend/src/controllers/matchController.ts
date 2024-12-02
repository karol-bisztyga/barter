import { Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';

export const updateMatchMatchingItem = async (req: AuthRequest, res: Response) => {
  // todo we may check if the user is the owner of the item and is allowed to update the match but for now idk
  const { newMatchingItemId, matchingItemId, matchedItemId } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('updating match matching item', newMatchingItemId, matchingItemId, matchedItemId);

    const queryResult = await client.query(
      'UPDATE matches SET matching_item_id = $1 WHERE matching_item_id = $2 AND matched_item_id = $3 RETURNING *',
      [newMatchingItemId, matchingItemId, matchedItemId]
    );
    const updateResult = queryResult.rows[0];

    await client.query('COMMIT');
    res.json({
      result: updateResult,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).send({ message: 'Server error: ' + err });
  } finally {
    client.release();
  }
};

export const unmatch = async (req: AuthRequest, res: Response) => {
  const { matchId } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    // find both users' ids
    const usersIdsQueryResult = await client.query(
      `SELECT
          user_id
      FROM
          items
      WHERE
          id IN (SELECT matching_item_id FROM matches WHERE id = $1)
      OR
          id IN (SELECT matched_item_id FROM matches WHERE id = $1)
      `,
      [matchId]
    );

    const usersIds = usersIdsQueryResult.rows.map((row) => row.user_id);
    if (usersIds.length !== 2) {
      throw new Error('Could not find both users');
    }

    await client.query('DELETE FROM messages WHERE match_id=$1', [matchId]);
    await client.query('DELETE FROM matches WHERE id = $1 RETURNING *', [matchId]);
    await client.query('COMMIT');
    res.json([
      {
        matchId,
        owner1Id: usersIds[0],
        owner2Id: usersIds[1],
      },
    ]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).send({ message: 'Server error: ' + err });
  } finally {
    client.release();
  }
};
