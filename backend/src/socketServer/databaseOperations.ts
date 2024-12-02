import pool from '../db';
import { ChatMessage, ItemData, UpdateMatchMatchingItemData } from './types';

export const addNewMessage = async (
  matchId: string,
  message: ChatMessage
): Promise<ChatMessage> => {
  const { content, type, userId } = message;
  // check if the match exists and if the user has access to it
  const matchCheckResult = await pool.query(
    `SELECT * FROM matches
     JOIN items AS item1 ON matches.matching_item_id = item1.id
     JOIN items AS item2 ON matches.matched_item_id = item2.id
     WHERE matches.id = $1 AND (item1.user_id = $2 OR item2.user_id = $2)`,
    [matchId, userId]
  );

  if (matchCheckResult.rows.length === 0) {
    throw new Error('Unauthorized or match not found');
  }

  // insert the new message into the database
  const currentTimestamp = new Date().getTime();

  const insertMessageResult = await pool.query(
    `INSERT INTO messages (sender_id, match_id, message_type, content, date_created)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, matchId, type, content, currentTimestamp]
  );

  const parsedResult = {
    id: insertMessageResult.rows[0].id,
    content: insertMessageResult.rows[0].content,
    type: insertMessageResult.rows[0].message_type,
    userId: insertMessageResult.rows[0].sender_id,
    dateCreated: insertMessageResult.rows[0].date_created,
  };

  return parsedResult;
};

export const getItemsDataByIds = async (itemsIds: string[]): Promise<ItemData[]> => {
  if (itemsIds.length === 0) {
    return [];
  }

  const itemsIdsAsIntegers = itemsIds.map((id) => parseInt(id, 10));

  const result = await pool.query(
    `
    SELECT
      items.id,
      items.name,
      items.description,
      items.user_id AS userId,
      ARRAY_AGG(items_images.url) AS images,
      users.name AS userName,
      users.location_city AS ownerLocationCity
    FROM items
    LEFT JOIN items_images ON items.id = items_images.item_id
    LEFT JOIN users ON items.user_id = users.id
    WHERE items.id = ANY($1)
    GROUP BY items.id, users.name, users.location_city, users.id
    ORDER BY array_position($1::int[], items.id)
  `,
    [itemsIdsAsIntegers]
  );

  const parsedResult: ItemData[] = result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    images: row.images || [],
    userId: row.userid,
    userName: row.username,
    ownerLocationCity: row.ownerlocationcity,
  }));

  return parsedResult;
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
