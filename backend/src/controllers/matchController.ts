import { Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getUserIdFromRequest } from '../utils';

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

export const updateMatchNotified = async (req: AuthRequest, res: Response) => {
  const { matchId, dateNotified } = req.body;
  const userId = getUserIdFromRequest(req);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get the matching and matched item owners
    const matchQueryResult = await client.query(
      `SELECT
          m.matching_item_id,
          m.matched_item_id,
          i1.user_id AS matching_owner_id,
          i2.user_id AS matched_owner_id
       FROM matches m
       JOIN items i1 ON m.matching_item_id = i1.id
       JOIN items i2 ON m.matched_item_id = i2.id
       WHERE m.id = $1`,
      [matchId]
    );

    if (matchQueryResult.rows.length === 0) {
      throw new Error('Match not found');
    }

    const { matching_owner_id, matched_owner_id } = matchQueryResult.rows[0];

    let columnToUpdate: string;

    // Determine which notification field to update
    if (userId === matching_owner_id) {
      columnToUpdate = 'date_matching_owner_notified';
    } else if (userId === matched_owner_id) {
      columnToUpdate = 'date_matched_owner_notified';
    } else {
      throw new Error('User not authorized to update this match');
    }

    const updateResult = await client.query(
      `
      UPDATE matches
      SET ${columnToUpdate} = $1
      WHERE id = $2
      RETURNING *`,
      [dateNotified, matchId]
    );
    if (updateResult.rows.length === 0) {
      throw new Error('Failed to update match notification');
    }

    await client.query('COMMIT');
    res.json(updateResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).send({ message: 'Server error: ' + err });
  } finally {
    client.release();
  }
};
