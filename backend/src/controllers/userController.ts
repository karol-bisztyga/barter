import { Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getUserIdFromRequest } from '../utils';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { StorageHandler } from '../utils/storageUtils';
dotenv.config();

export const updateUser = async (req: AuthRequest, res: Response) => {
  const updates = JSON.parse(req.body.updates);

  const availableFields = [
    'name',
    'phone',
    'facebook',
    'instagram',
    'location_city',
    'location_coordinate_lat',
    'location_coordinate_lon',
  ];

  try {
    const userId = getUserIdFromRequest(req);

    const currentTimestamp = new Date().getTime();

    let updateQueryPart = '';
    for (const update of updates) {
      if (availableFields.indexOf(update.field) === -1) {
        throw new Error('Invalid field name: ' + update.field);
      }
      updateQueryPart += `${update.field}='${update.value}',`;
    }

    // todo this parameterized query didn't work for some reason, I was getting syntax errors
    const query = `UPDATE users SET ${updateQueryPart} date_edited=${currentTimestamp} WHERE id=${userId} RETURNING *`;
    const result = await pool.query(query, []);

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
    const storageHandler = new StorageHandler();

    const userId = getUserIdFromRequest(req);
    const currentTimestamp = new Date().getTime();
    const bucketUrl = await storageHandler.composeBucketUrl('profile-pictures');
    await storageHandler.uploadFile(bucketUrl, fileName, fileContent);
    const url = `${STORAGE_FILES_BASE_URL}/${bucketUrl}/${fileName}`;
    // remove previous picture
    const currentProfilePictureResult = await pool.query(
      `SELECT profile_picture FROM users WHERE id=$1`,
      [userId]
    );
    const currentProfilePicture = currentProfilePictureResult.rows[0].profile_picture;
    if (currentProfilePicture) {
      const fileName = currentProfilePicture.split('/').pop();
      if (!fileName) {
        throw new Error('file name not found in url');
      }
      const bucketId = (await storageHandler.getBucketDataByName(bucketUrl)).bucketId;
      console.log('deleting previous picture', bucketId, fileName);
      await storageHandler.deleteFile(bucketId, fileName);
    }
    // update in the DB
    const updateResult = await pool.query(
      `UPDATE users SET profile_picture='${url}', date_edited = ${currentTimestamp} WHERE id=${userId} RETURNING profile_picture`,
      []
    );
    res.json(updateResult.rows[0]);
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
    const storageHandler = new StorageHandler();
    // items images
    console.log('deleting items images');
    const itemsImagesBucketData = await storageHandler.getBucketDataByName(
      await storageHandler.composeBucketUrl('items-images')
    );
    for (const itemImageUrl of itemsImagesUrls) {
      const fileName = itemImageUrl.split('/').pop();
      if (!fileName) {
        throw new Error('file name not found in url: ' + itemImageUrl);
      }
      console.log('deleting file', itemsImagesBucketData.bucketId, fileName);
      await storageHandler.deleteFile(itemsImagesBucketData.bucketId, fileName);
    }
    // profile image
    console.log('deleting profile image');
    const profilePicturesBucketData = await storageHandler.getBucketDataByName(
      await storageHandler.composeBucketUrl('profile-pictures')
    );
    if (usersProfileImage) {
      const fileName = usersProfileImage.split('/').pop();
      if (!fileName) {
        throw new Error('file name not found in url: ' + usersProfileImage);
      }
      console.log('deleting file', profilePicturesBucketData.bucketId, fileName);
      await storageHandler.deleteFile(profilePicturesBucketData.bucketId, fileName);
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

export const updateOnboarded = async (req: AuthRequest, res: Response) => {
  const { onboarded } = req.body;

  try {
    const userId = getUserIdFromRequest(req);

    const currentTimestamp = new Date().getTime();

    const result = await pool.query(
      `UPDATE users SET onboarded='${onboarded}', date_edited = ${currentTimestamp} WHERE id=${userId} RETURNING *`,
      []
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send({ message: 'Server error: ' + err });
  }
};
