import { Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getUserIdFromRequest } from '../utils';

export const addLike = async (req: AuthRequest, res: Response) => {
  const { likedItemId, decision } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('posting like', likedItemId, decision);
    const userId = getUserIdFromRequest(req);

    const queryResult = await pool.query(
      'INSERT INTO likes (liker_id, liked_id, decision) VALUES ($1, $2, $3) RETURNING *',
      [userId, likedItemId, decision]
    );
    const likeResult = queryResult.rows[0];
    console.log('like result', likeResult);

    // on successful like check for a match, if it matched, retrun the info about the new match and automatically create it in the db here
    // with a random (or least used) user item.
    // the user will see the screen where they will be able to switch the item with the one they like but we want to create a match right away
    // in case frontend crashes or user closes the app or whatever else

    // znajdz:
    // - ownera polajkowanego itemu
    // - moje przedmioty
    // - lajki tego ownera do moich itemow - te itemy bede mogl zaproponowac do wymiany w matchu
    // -

    // const myItemsLikedByTargetItemOwnerResult = await pool.query();

    const myItemsLikedByTargetItemOwnerResult = await pool.query(
      `SELECT
        items.id AS id,
        items.name AS name,
        items.description AS description,
        ARRAY_AGG(items_images.url) AS images
      FROM
        likes
      LEFT JOIN
        items ON likes.liked_id = items.id
      LEFT JOIN
        items_images ON items.id = items_images.item_id
      WHERE
        liked_id IN (SELECT id FROM items WHERE user_id = $1) -- selecting my items
      AND
        liker_id = (SELECT user_id FROM items WHERE id = $2) -- selecting likes from the owner of the liked item
      AND
        decision = true
      GROUP BY
          items.id
      `,
      [userId, likeResult.liked_id]
    );
    const myItemsLikedByTargetItemOwner = myItemsLikedByTargetItemOwnerResult.rows;
    console.log('likes from liked item owner to my items', myItemsLikedByTargetItemOwner);
    if (myItemsLikedByTargetItemOwner.length) {
      console.log(`IT'S A MATCH!`);
      // TODO create a match query inserting a random user element (can be switched later)
    }

    await client.query('COMMIT');
    res.json(likeResult);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).send({ message: 'Server error: ' + err });
  } finally {
    client.release();
  }
};
