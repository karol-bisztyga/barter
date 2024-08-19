import { Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getUserIdFromRequest } from '../utils';

export const updateUser = async (req: AuthRequest, res: Response) => {
  const { fieldName, fieldValue } = req.body;

  const availableFields = ['name', 'phone', 'facebook', 'instagram', 'location'];

  try {
    if (availableFields.indexOf(fieldName) === -1) {
      throw new Error('Invalid field name');
    }
    const userId = getUserIdFromRequest(req);

    const currentTimestamp = new Date().getTime();

    // todo this parameterized query didn't work for some reason, I was getting syntax errors
    const result = await pool.query(
      `UPDATE users SET ${fieldName}='${fieldValue}', date_edited = ${currentTimestamp} WHERE id=${userId} RETURNING *`,
      []
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send({ message: 'Server error: ' + err });
  }
};
