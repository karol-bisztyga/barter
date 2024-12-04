import pool from '../db';
import {
  AddNewMessageResult,
  ChatMessage,
  ItemData,
  MatchData,
  UpdateMatchMatchingItemData,
} from './types';

export const addNewMessage = async (
  matchId: string,
  message: ChatMessage
): Promise<AddNewMessageResult> => {
  const { content, type, userId } = message;

  // Check if the match exists and if the user has access to it, and fetch both user IDs
  const matchCheckResult = await pool.query(
    `
    SELECT 
      item1.user_id AS matching_user_id,
      item2.user_id AS matched_user_id
    FROM matches
    JOIN items AS item1 ON matches.matching_item_id = item1.id
    JOIN items AS item2 ON matches.matched_item_id = item2.id
    WHERE matches.id = $1 AND (item1.user_id = $2 OR item2.user_id = $2)
    `,
    [matchId, userId]
  );

  if (matchCheckResult.rows.length === 0) {
    throw new Error('Unauthorized or match not found');
  }

  // Extract both user IDs
  const { matching_user_id, matched_user_id } = matchCheckResult.rows[0];

  // Insert the new message into the database
  const currentTimestamp = new Date().getTime();

  const insertMessageResult = await pool.query(
    `
    INSERT INTO messages (sender_id, match_id, message_type, content, date_created)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [userId, matchId, type, content, currentTimestamp]
  );

  // Update the match's last updated timestamp
  await pool.query(
    `
    UPDATE matches SET date_updated = $1 WHERE id = $2
    `,
    [currentTimestamp, matchId]
  );

  // Prepare the response object
  const parsedResult = {
    id: insertMessageResult.rows[0].id,
    content: insertMessageResult.rows[0].content,
    type: insertMessageResult.rows[0].message_type,
    userId: insertMessageResult.rows[0].sender_id,
    dateCreated: insertMessageResult.rows[0].date_created,
    matchingUserId: matching_user_id,
    matchedUserId: matched_user_id,
    dateMatchNotificationUpdated: currentTimestamp,
  };

  return parsedResult;
};
export const getNewMatchData = async (
  matchId: string,
  matchingItemId: string,
  matchedItemId: string
): Promise<MatchData> => {
  const itemsIdsAsIntegers = [parseInt(matchingItemId), parseInt(matchedItemId)];

  const result = await pool.query(
    `
    SELECT
      items.id,
      items.name,
      items.description,
      items.user_id AS userId,
      ARRAY_AGG(items_images.url) AS images,
      users.name AS userName,
      users.location_city AS ownerLocationCity,
      matches.date_updated,
      matches.date_matching_owner_notified,
      matches.date_matched_owner_notified
    FROM matches
    JOIN items ON items.id IN (matches.matching_item_id, matches.matched_item_id)
    LEFT JOIN items_images ON items.id = items_images.item_id
    LEFT JOIN users ON items.user_id = users.id
    WHERE matches.id = $1 AND items.id = ANY($2)
    GROUP BY items.id, users.name, users.location_city, users.id, matches.date_updated, matches.date_matching_owner_notified, matches.date_matched_owner_notified
    ORDER BY array_position($2::int[], items.id)
  `,
    [matchId, itemsIdsAsIntegers]
  );

  if (result.rows.length !== 2) {
    throw new Error('items not found');
  }
  const itemsData: ItemData[] = result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    images: row.images || [],
    userId: row.userid,
    userName: row.username,
    ownerLocationCity: row.ownerlocationcity,
  }));

  return {
    id: matchId,
    matchingItem: itemsData[0],
    matchedItem: itemsData[1],
    dateUpdated: result.rows[0]?.date_updated || null,
  };
};

export const updateMatchMatchingItem = async (
  data: UpdateMatchMatchingItemData
): Promise<{ owners: string[]; newMatchingItem: ItemData }> => {
  const { matchId, newMatchingItemId } = data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const ownersResult = await client.query(
      `
      SELECT 
        items1.user_id AS matching_item_owner_id,
        items2.user_id AS matched_item_owner_id
      FROM 
        matches
      JOIN 
        items AS items1 ON matches.matching_item_id = items1.id
      JOIN 
        items AS items2 ON matches.matched_item_id = items2.id
      WHERE 
        matches.id = $1;
      `,
      [matchId]
    );

    if (!ownersResult.rows.length) {
      throw new Error('match not found');
    }

    const owners = [
      ownersResult.rows[0].matching_item_owner_id,
      ownersResult.rows[0].matched_item_owner_id,
    ];

    // Update the matching item with the new item ID
    await client.query(`UPDATE matches SET matching_item_id = $1 WHERE id = $2`, [
      newMatchingItemId,
      matchId,
    ]);

    // Retrieve detailed data for both items (matched and new matching)
    const newMatchingItemDataResult = await client.query(
      `SELECT 
        items.id,
        items.name,
        items.description,
        ARRAY_AGG(items_images.url) AS images,
        users.name AS userName,
        users.location_city AS ownerLocationCity,
        users.id AS owner_id
       FROM items 
       LEFT JOIN items_images ON items.id = items_images.item_id
       LEFT JOIN users ON items.user_id = users.id
       WHERE items.id = $1
       GROUP BY items.id, users.name, users.location_city, users.id`,
      [newMatchingItemId]
    );

    if (!newMatchingItemDataResult.rows.length) {
      throw new Error('item not found');
    }

    const newMatchingItemOnwerId = newMatchingItemDataResult.rows[0].owner_id;
    if (owners[0] !== newMatchingItemOnwerId) {
      throw new Error('item owner does not match');
    }

    const newItemRow = newMatchingItemDataResult.rows.find((row) => row.id === newMatchingItemId);
    const newMatchingItem: ItemData = {
      id: newItemRow.id,
      name: newItemRow.name,
      description: newItemRow.description,
      images: newItemRow.images,
      ownerLocationCity: newItemRow.ownerlocationcity,
      userName: newItemRow.username,
    };

    await client.query('COMMIT');

    return { owners, newMatchingItem };
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(`Error updating matching item: ${error}`);
  } finally {
    client.release();
  }
};

export const getMatches = async (userId: string) => {
  try {
    const queryResult = await pool.query(
      `
      SELECT
          matches.id AS id,
          matches.date_matching_owner_notified AS date_matching_owner_notified,
          matches.date_matched_owner_notified AS date_matched_owner_notified,
          matches.date_updated AS date_updated,

          matching_item.id AS matching_item_id,
          matching_item.name AS matching_item_name,
          matching_item.description AS matching_item_description,
          matching_item_user.name AS matching_item_user_name,
          matching_item_user.id AS matching_item_user_id,
          ARRAY_AGG(matching_item_images.url ORDER BY matching_item_images.id) AS matching_item_images,
          
          matched_item.id AS matched_item_id,
          matched_item.name AS matched_item_name,
          matched_item.description AS matched_item_description,
          matched_item_user.name AS matched_item_user_name,
          matched_item_user.id AS matched_item_user_id,
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
          matches.id, matching_item.id, matched_item.id, matching_item_user.name, matched_item_user.name, matching_item_user.id, matched_item_user.id
      ORDER BY
          matches.date_created DESC`,
      [userId]
    );
    const parsedQueryResult = queryResult.rows.map((row) => {
      let dateNotified = null;
      if (row.matching_item_user_id === userId) {
        dateNotified = row.date_matching_owner_notified;
      } else if (row.matched_item_user_id === userId) {
        dateNotified = row.date_matched_owner_notified;
      }
      if (dateNotified === null) {
        throw new Error(
          'current user does not seem to be a part of this match [match id: ' +
            row.id +
            '][matching_item_user.id: ' +
            row.matching_item_user_id +
            '][matched_item_user.id: ' +
            row.matched_item_user_id +
            ']'
        );
      }
      return {
        id: row.id,
        dateNotified,
        dateUpdated: row.date_updated,
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

    return parsedQueryResult;
  } catch (err) {
    console.error(`Error getting matches for user: ${userId}`);
    throw err;
  }
};
