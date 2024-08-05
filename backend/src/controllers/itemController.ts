import { Response } from 'express';
import pool from '../db';
import { Item } from '../models/Item';
import { AuthRequest } from '../middlewares/authMiddleware';

export const createItem = async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;
  const userId = req.user.id;

  const newItem: Item = { name, description, user_id: userId };

  try {
    const result = await pool.query(
      'INSERT INTO items (name, description, user_id) VALUES ($1, $2, $3) RETURNING *',
      [newItem.name, newItem.description, newItem.user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).send({ message: 'Server error' });
  }
};

export const getItems = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  try {
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
  const { name, description } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'UPDATE items SET name = $1, description = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [name, description, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ message: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send({ message: 'Server error' });
  }
};

export const deleteItem = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
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
