import { Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getUserIdFromRequest } from '../utils';
import bcrypt from 'bcryptjs';
import { b2Authenticate, composeBucketUrl, uploadFile } from '../utils/storageUtils';
import dotenv from 'dotenv';
dotenv.config();

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

export const changePassword = async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const userId = getUserIdFromRequest(req);

    const currentTimestamp = new Date().getTime();

    const currentPasswordResult = await pool.query('SELECT password FROM users WHERE id = $1', [
      userId,
    ]);
    const currentPasswordHash = currentPasswordResult.rows[0].password;

    const validPassword = await bcrypt.compare(currentPassword, currentPasswordHash);
    if (!validPassword) {
      return res.status(400).send({ message: 'current password incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // todo this parameterized query didn't work for some reason, I was getting syntax errors
    const result = await pool.query(
      `UPDATE users SET password='${hashedPassword}', date_edited = ${currentTimestamp} WHERE id=${userId} RETURNING *`,
      []
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send({ message: 'Server error: ' + err });
  }
};

export const updateProfilePicture = async (req: AuthRequest, res: Response) => {
  const { fileName, fileContent } = req.body;

  try {
    const { STORAGE_FILES_BASE_URL } = process.env;

    if (!STORAGE_FILES_BASE_URL) {
      throw new Error('storage base url is missing');
    }

    await b2Authenticate();

    const userId = getUserIdFromRequest(req);
    const currentTimestamp = new Date().getTime();
    const bucketUrl = composeBucketUrl('profile-pictures');
    await uploadFile(bucketUrl, fileName, fileContent);
    const url = `${STORAGE_FILES_BASE_URL}/${bucketUrl}/${fileName}`;
    const result = await pool.query(
      `UPDATE users SET profile_picture='${url}', date_edited = ${currentTimestamp} WHERE id=${userId} RETURNING profile_picture`,
      []
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send({ message: 'Server error: ' + err });
  }
};
