import { Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getUserIdFromRequest } from '../utils';

export const getMatches = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserIdFromRequest(req);

    const queryResult = await pool.query(
      `
      SELECT
          matches.id AS id,
          
          matching_item.id AS matching_item_id,
          matching_item.name AS matching_item_name,
          matching_item.description AS matching_item_description,
          ARRAY_AGG(matching_item_images.url) AS matching_item_images,
          
          matched_item.id AS matched_item_id,
          matched_item.name AS matched_item_name,
          matched_item.description AS matched_item_description,
          ARRAY_AGG(matched_item_images.url) AS matched_item_images
      FROM
          matches

      JOIN
          items matching_item ON matching_item.id = matches.matching_item_id
      JOIN
          items_images matching_item_images ON matching_item.id = matching_item_images.item_id

      JOIN
          items matched_item ON matched_item.id = matches.matched_item_id
      JOIN
          items_images matched_item_images ON matched_item.id = matched_item_images.item_id

      WHERE
          matching_item_id IN (SELECT id FROM items WHERE user_id = $1)
      GROUP BY
          matches.id, matching_item.id, matched_item.id`,
      [userId]
    );
    const result = queryResult.rows.map((row) => {
      return {
        id: row.id,
        matchingItem: {
          id: row.matching_item_id,
          name: row.matching_item_name,
          description: row.matching_item_description,
          images: [...new Set(row.matching_item_images)],
        },
        matchedItem: {
          id: row.matched_item_id,
          name: row.matched_item_name,
          description: row.matched_item_description,
          images: [...new Set(row.matched_item_images)],
        },
      };
    });

    console.log('match result', result);

    res.json(result);
  } catch (err) {
    res.status(500).send({ message: 'Server error: ' + err });
  }
};

export const updateMatchMatchingItem = async (req: AuthRequest, res: Response) => {
  // todo we may check if the user is the owner of the item and is allowed to update the match but for now idk
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
