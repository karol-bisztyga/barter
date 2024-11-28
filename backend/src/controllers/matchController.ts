import { Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getUserIdFromRequest } from '../utils';
import { PoolClient } from 'pg';

export const getMatches = async (req: AuthRequest, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const { localDateUpdated } = req.query;
  const queryResult = await pool.query(
    'SELECT date_updated FROM matches_updates WHERE user_id = $1',
    [userId]
  );
  const serverDateUpdated = queryResult.rows[0]?.date_updated;
  if (serverDateUpdated === localDateUpdated) {
    return res.json({
      dateUpdated: serverDateUpdated,
    });
  }
  try {
    const queryResult = await pool.query(
      `
      SELECT
          matches.id AS id,

          matching_item.id AS matching_item_id,
          matching_item.name AS matching_item_name,
          matching_item.description AS matching_item_description,
          matching_item_user.name AS matching_item_user_name,
          ARRAY_AGG(matching_item_images.url ORDER BY matching_item_images.id) AS matching_item_images,
          
          matched_item.id AS matched_item_id,
          matched_item.name AS matched_item_name,
          matched_item.description AS matched_item_description,
          matched_item_user.name AS matched_item_user_name,
          ARRAY_AGG(matched_item_images.url ORDER BY matched_item_images.id) AS matched_item_images
      FROM
          matches

      JOIN
          items matching_item ON matching_item.id = matches.matching_item_id
      JOIN
          items_images matching_item_images ON matching_item.id = matching_item_images.item_id
      JOIN
          users matching_item_user ON matching_item.user_id = matching_item_user.id

      JOIN
          items matched_item ON matched_item.id = matches.matched_item_id
      JOIN
          items_images matched_item_images ON matched_item.id = matched_item_images.item_id
      JOIN
          users matched_item_user ON matched_item.user_id = matched_item_user.id

      WHERE
          matching_item_id IN (SELECT id FROM items WHERE user_id = $1)
      OR
          matched_item_id IN (SELECT id FROM items WHERE user_id = $1)
      GROUP BY
          matches.id, matching_item.id, matched_item.id, matching_item_user.name, matched_item_user.name
      ORDER BY
          matches.date_created DESC`,
      [userId]
    );
    const parsedQueryResult = queryResult.rows.map((row) => {
      return {
        id: row.id,
        matchingItem: {
          id: row.matching_item_id,
          name: row.matching_item_name,
          description: row.matching_item_description,
          userName: row.matching_item_user_name,
          images: [...new Set(row.matching_item_images)],
        },
        matchedItem: {
          id: row.matched_item_id,
          name: row.matched_item_name,
          description: row.matched_item_description,
          userName: row.matched_item_user_name,
          images: [...new Set(row.matched_item_images)],
        },
      };
    });

    const result = {
      matches: parsedQueryResult,
      dateUpdated: serverDateUpdated,
    };

    res.json(result);
  } catch (err) {
    res.status(500).send({ message: 'Server error: ' + err });
  }
};

export const updateMatchDateUpdated = async (
  client: PoolClient,
  dateNow: number,
  userId: string
) => {
  const dateUpdatedResult = await client.query(
    `
        UPDATE matches_updates SET date_updated = $1 WHERE user_id = $2 RETURNING *
      `,
    [dateNow, userId]
  );
  console.log('matches_updates::dateUpdatedResult', dateUpdatedResult.rows);
  return dateUpdatedResult.rows;
};

export const updateMatchMatchingItem = async (req: AuthRequest, res: Response) => {
  // todo we may check if the user is the owner of the item and is allowed to update the match but for now idk
  const { newMatchingItemId, matchingItemId, matchedItemId } = req.body;
  const dateNow = Date.now();
  const userId = getUserIdFromRequest(req);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('updating match matching item', newMatchingItemId, matchingItemId, matchedItemId);

    const queryResult = await client.query(
      'UPDATE matches SET matching_item_id = $1 WHERE matching_item_id = $2 AND matched_item_id = $3 RETURNING *',
      [newMatchingItemId, matchingItemId, matchedItemId]
    );
    const updateResult = queryResult.rows[0];

    await updateMatchDateUpdated(client, dateNow, userId);

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
  const dateNow = Date.now();
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
    for (const userId of usersIds) {
      await updateMatchDateUpdated(client, dateNow, userId);
    }
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
