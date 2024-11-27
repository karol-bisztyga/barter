import { Request, Response } from 'express';
import { getUserIdFromRequest } from '../utils';
import pool from '../db';

export const getMessages = async (req: Request, res: Response) => {
  const { matchId } = req.query;
  const offset = parseInt(req.query.offset as string) || 0;
  const limit = parseInt(req.query.limit as string) || 10;

  const userId = getUserIdFromRequest(req);

  try {
    // check if the match exists and if the user has access to it
    const matchCheckResult = await pool.query(
      `SELECT * FROM matches
       JOIN items AS item1 ON matches.matching_item_id = item1.id
       JOIN items AS item2 ON matches.matched_item_id = item2.id
       WHERE matches.id = $1 AND (item1.user_id = $2 OR item2.user_id = $2)`,
      [matchId, userId]
    );

    if (matchCheckResult.rows.length === 0) {
      return res.status(403).send({ message: 'Unauthorized or match not found' });
    }

    // fetch messages with pagination
    const messagesResult = await pool.query(
      `SELECT 
         messages.id as id,
         messages.sender_id as sender_id,
         messages.message_type as message_type,
         messages.content as content,
         messages.date_created as date_created
       FROM 
         messages
       WHERE 
         messages.match_id = $1
       ORDER BY 
         messages.id
       DESC
       LIMIT $2 OFFSET $3`,
      [matchId, limit, offset]
    );

    const messageResultParsed = messagesResult.rows.map((message) => ({
      id: message.id,
      userId: message.sender_id,
      messageType: message.message_type,
      content: message.content,
      dateCreated: message.date_created,
    }));

    res.json({ messages: messageResultParsed });
  } catch (err) {
    res.status(500).send({ message: 'Server error: ' + err });
  }
};
