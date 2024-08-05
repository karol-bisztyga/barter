import { Response } from 'express';
import pool from '../db';
import { Item } from '../models/Item';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getUserIdFromRequest } from '../utils';

export const createItem = async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;
  try {
    const userId = getUserIdFromRequest(req);

    const newItem: Item = { name, description, user_id: userId };

    const result = await pool.query(
      'INSERT INTO items (name, description, user_id) VALUES ($1, $2, $3) RETURNING *',
      [newItem.name, newItem.description, newItem.user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).send({ message: 'Server error: ' + err });
  }
};

export const getItems = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserIdFromRequest(req);

    const result = await pool.query(
      `SELECT 
        items.id AS id,
        items.name AS name,
        items.description AS description,
        ARRAY_AGG(items_images.url) AS images
      FROM 
          items
      LEFT JOIN 
          items_images ON items.id = items_images.item_id
      WHERE 
          items.user_id = $1
      GROUP BY 
          items.id, items.name, items.description;
      `,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send({ message: 'Server error: ' + err });
  }
};

export const updateItem = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, images } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const userId = getUserIdFromRequest(req);

    const itemResult = await client.query(
      'UPDATE items SET name = $1, description = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [name, description, id, userId]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).send({ message: 'Item not found' });
    }

    const result: Record<string, string> = itemResult.rows[0];

    if (images) {
      const parsedImages = JSON.parse(images).map((url: string) => [id, url]);
      await client.query('DELETE FROM items_images WHERE item_id = $1', [id]);

      const insertQuery = `
            INSERT INTO items_images (item_id, url)
            VALUES ${parsedImages.map((_: [string, string], i: number) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(', ')}
            RETURNING *;
        `;
      const values = parsedImages.flatMap((itemImage: [string, string]) => [
        itemImage[0],
        itemImage[1],
      ]);
      const imagesResult = await client.query(insertQuery, values);

      const imagesResultParsed = imagesResult.rows.map((row: Record<string, number>) => row.url);

      result.images = JSON.stringify(imagesResultParsed);
    }

    await client.query('COMMIT');
    res.json(result);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).send({ message: 'Server error: ' + err });
  } finally {
    client.release();
  }
};

export const deleteItem = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const userId = getUserIdFromRequest(req);

    const result = await pool.query(
      'DELETE FROM items WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ message: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send({ message: 'Server error' });
  }
};
