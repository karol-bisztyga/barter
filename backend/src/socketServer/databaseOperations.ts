import pool from '../db';
import { ChatMessage } from './types';

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
