import { Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getUserIdFromRequest } from '../utils';
import bcrypt from 'bcryptjs';
import {
  b2Authenticate,
  composeBucketUrl,
  deleteFile,
  getBucketDataByName,
  uploadFile,
} from '../utils/storageUtils';
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

export const deleteUser = async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userId = getUserIdFromRequest(req);

    // todo this parameterized query didn't work for some reason, I was getting syntax errors
    const usersItemsIdsResult = await client.query(`SELECT id FROM items WHERE user_id=$1`, [
      userId,
    ]);
    const usersItemsIds = usersItemsIdsResult.rows.map((item) => item.id);
    console.log('user items ids', usersItemsIds);

    let usersMatchesIds = [];
    if (usersItemsIds.length) {
      const usersMatchesIdsResult = await client.query(
        `SELECT * FROM matches WHERE matching_item_id IN (${usersItemsIds.join(',')}) OR matched_item_id IN (${usersItemsIds.join(',')})`,
        []
      );
      usersMatchesIds = usersMatchesIdsResult.rows.map((match) => match.id);
    }
    console.log('user matches ids', usersMatchesIds);

    let itemsImagesUrls = [];
    if (usersItemsIds.length) {
      const itemsImagesUrlsResult = await client.query(
        `SELECT * FROM items_images WHERE item_id IN (${usersItemsIds.join(',')})`,
        []
      );
      itemsImagesUrls = itemsImagesUrlsResult.rows.map((itemImage) => itemImage.url);
    }

    const usersProfileImageResult = await client.query(
      'SELECT profile_picture FROM users WHERE id=$1',
      [userId]
    );
    const usersProfileImage = usersProfileImageResult.rows[0].profile_picture;

    // DELETING FROM DATABASE
    // likes
    if (usersItemsIds.length) {
      console.log('deleting likes');
      await client.query(
        `DELETE FROM likes WHERE liker_id=$1 OR liked_id IN (${usersItemsIds.join(',')})`,
        [userId]
      );
    }
    // messages
    if (usersMatchesIds.length) {
      console.log('deleting messages');
      await client.query(
        `DELETE FROM messages WHERE match_id IN (${usersMatchesIds.join(',')})`,
        []
      );
    }
    // matches_updates
    console.log('deleting matches_updates');
    await client.query(`DELETE FROM matches_updates WHERE user_id=$1`, [userId]);
    // matches
    if (usersMatchesIds.length) {
      console.log('deleting matches');
      await client.query(`DELETE FROM matches WHERE id IN (${usersMatchesIds.join(',')})`, []);
    }
    // items_images
    if (usersItemsIds.length) {
      console.log('deleting items_images');
      await client.query(
        `DELETE FROM items_images WHERE item_id IN (${usersItemsIds.join(',')})`,
        []
      );
    }
    // items
    if (usersItemsIds.length) {
      console.log('deleting items');
      await client.query(`DELETE FROM items WHERE id IN (${usersItemsIds.join(',')})`, []);
    }
    // users
    console.log('deleting user');
    await client.query(`DELETE FROM users WHERE id=$1`, [userId]);

    console.log('deleting DONE');

    // DELETING FROM STORAGE
    await b2Authenticate();
    // items images
    console.log('deleting items images');
    const itemsImagesBucketData = await getBucketDataByName(composeBucketUrl('items-images'));
    for (const itemImageUrl of itemsImagesUrls) {
      const fileName = itemImageUrl.split('/').pop();
      if (!fileName) {
        throw new Error('file name not found in url: ' + itemImageUrl);
      }
      console.log('deleting file', itemsImagesBucketData.bucketId, fileName);
      await deleteFile(itemsImagesBucketData.bucketId, fileName);
    }

    // profile image
    console.log('deleting profile image');
    const profilePicturesBucketData = await getBucketDataByName(
      composeBucketUrl('profile-pictures')
    );
    if (usersProfileImage) {
      const fileName = usersProfileImage.split('/').pop();
      if (!fileName) {
        throw new Error('file name not found in url: ' + usersProfileImage);
      }
      console.log('deleting file', profilePicturesBucketData.bucketId, fileName);
      await deleteFile(profilePicturesBucketData.bucketId, fileName);
    }

    await client.query('COMMIT');
    res.json({});
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).send({ message: 'Server error: ' + err });
  } finally {
    client.release();
  }
};
