import pool from '../db';
import { ChatMessage } from '../types';

export const getMessages = async (matchId: string, offset: string = '0', limit: string = '10') => {
  if (!matchId) {
    throw new Error('get messages: match id is not provided');
  }

  const queryResult = await pool.query(
    'SELECT * FROM messages WHERE match_id = $1 ORDER BY date_created DESC LIMIT $2 OFFSET $3',
    [matchId, limit, offset]
  );

  const result = queryResult.rows.map((row) => {
    return {
      id: row.id,
      content: row.content,
      type: row.message_type,
      userId: row.sender_id,
      matchId: row.match_id,
      dateCreated: row.date_created,
    };
  });

  return result;
};

export const addNewMessage = async (matchId: string, message: ChatMessage) => {
  const { content, type, userId } = message;

  if (!userId) {
    throw new Error('add message: user id is not provided');
  }

  console.log('> adding message to database', userId, matchId, type, content);

  const queryResult = await pool.query(
    'INSERT INTO messages (sender_id, match_id, message_type, content) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, matchId, type, content]
  );

  const result = queryResult.rows[0];

  return result;
};
