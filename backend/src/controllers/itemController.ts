import { Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getUserIdFromRequest } from '../utils';
import { updateMatchDateUpdated } from './matchController';
import { MAX_ITEM_PICTURES } from '../constants';
import { StorageHandler } from '../utils/storageUtils';
import * as QueryString from 'qs';

export const createItem = async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;
  try {
    const userId = getUserIdFromRequest(req);

    const itemResult = await pool.query(
      'INSERT INTO items (name, description, user_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, userId]
    );

    const result = itemResult.rows[0];
    res.json(result);
  } catch (err) {
    res.status(500).send({ message: 'Server error: ' + err });
  }
};

export const getUserItems = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserIdFromRequest(req);

    const result = await pool.query(
      `SELECT 
        items.id AS id,
        items.name AS name,
        items.description AS description,
        ARRAY_AGG(items_images.url ORDER BY items_images.id) AS images
      FROM 
          items
      JOIN 
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
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const userId = getUserIdFromRequest(req);

    const currentTimestamp = new Date().getTime();

    const itemResult = await client.query(
      'UPDATE items SET name = $1, description = $2, date_edited = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [name, description, currentTimestamp, id, userId]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).send({ message: 'Item not found' });
    }

    const result: Record<string, string> = itemResult.rows[0];

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
  const itemId = req.params.id;
  const client = await pool.connect();
  const dateNow = Date.now();
  const userId = getUserIdFromRequest(req);
  try {
    await client.query('BEGIN');
    // remove images
    const itemImagesResult = await client.query('SELECT * FROM items_images WHERE item_id = $1', [
      itemId,
    ]);
    const storageHandler = new StorageHandler();
    const { bucketId } = await storageHandler.getBucketDataByName(
      await storageHandler.composeBucketUrl('items-images')
    );
    for (const itemImage of itemImagesResult.rows) {
      const fileName = itemImage.url.split('/').pop();
      if (!fileName) {
        throw new Error('file name not found in url');
      }
      await storageHandler.deleteFile(bucketId, fileName);
      await pool.query('DELETE FROM items_images WHERE item_id = $1 AND url = $2', [
        itemId,
        itemImage.url,
      ]);
    }
    // remove rest
    const matchesIdsResult = await client.query(
      'SELECT id FROM matches WHERE matching_item_id = $1 OR matched_item_id = $1',
      [itemId]
    );
    const matchesIds = matchesIdsResult.rows.map((row: Record<string, string>) => row.id);
    if (matchesIds.length) {
      await client.query(
        `DELETE FROM messages WHERE match_id IN (${matchesIds.map((_: string, i: number) => `$${i + 1}`).join(', ')})`,
        matchesIds
      );
    }
    updateMatchDateUpdated(client, dateNow, userId);
    await client.query('DELETE FROM matches WHERE matching_item_id = $1 OR matched_item_id = $1', [
      itemId,
    ]);
    await client.query('DELETE FROM likes WHERE liked_id = $1', [itemId]);
    await client.query('DELETE FROM items WHERE id = $1', [itemId]);
    await client.query('COMMIT');
    res.json(true);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).send({ message: 'Server error: ' + err });
  } finally {
    client.release();
  }
};

/**
 * items fetched for a specific user
 * items should be fetched in random order
 * items that are already liked/disliked by the user should not be included
 * items should be fetched in batches of certain size
 *
 * this algorithm requires further work (which items to fetch first or something) or not!
 */
export const getItemsForCards = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { limit, currentCardsIds } = req.query;

    const currentCardsIdsArr: string[] = (JSON.parse(currentCardsIds as string) as string[]) || [];

    let additionalCondition = '';
    let queryArgs: Array<
      string | QueryString.ParsedQs | string[] | QueryString.ParsedQs[] | undefined
    > = [userId, limit];

    if (currentCardsIdsArr.length) {
      additionalCondition = `AND items.id NOT IN (${currentCardsIdsArr.map((_: string, i: number) => `$${i + 2}`).join(', ')})`;
      queryArgs = [userId, ...currentCardsIdsArr, limit];
    }

    const query = `
      SELECT
        items.id AS id,
        items.name AS name,
        items.description AS description,
        ARRAY_AGG(items_images.url) AS images,
        target_item_owner.location_city AS owner_location_city,
        curr_user.location_city AS current_user_location_city,
        CAST(curr_user.location_coordinate_lat AS NUMERIC) AS user_location_lat,
        CAST(curr_user.location_coordinate_lon AS NUMERIC) AS user_location_lon,
        CAST(target_item_owner.location_coordinate_lat AS NUMERIC) AS target_location_lat,
        CAST(target_item_owner.location_coordinate_lon AS NUMERIC) AS target_location_lon,
        round(earth_distance(
            ll_to_earth(CAST(curr_user.location_coordinate_lat AS NUMERIC), CAST(curr_user.location_coordinate_lon AS NUMERIC)),
            ll_to_earth(CAST(target_item_owner.location_coordinate_lat AS NUMERIC), CAST(target_item_owner.location_coordinate_lon AS NUMERIC))
        )/5000) AS distance_km
      FROM
          items
      JOIN
          items_images ON items.id = items_images.item_id
      JOIN
          users curr_user ON curr_user.id = $1
      JOIN
          users target_item_owner ON target_item_owner.id = items.user_id
      WHERE
          items.user_id <> $1
      AND
          items.id NOT IN (SELECT liked_id FROM likes WHERE liker_id = $1)
      ${additionalCondition}
      GROUP BY
          items.id,
          items.name,
          items.description,
          target_item_owner.location_city,
          curr_user.location_coordinate_lat,
          curr_user.location_coordinate_lon,
          target_item_owner.location_coordinate_lat,
          target_item_owner.location_coordinate_lon,
          current_user_location_city
      ORDER BY
        CASE
            WHEN curr_user.location_coordinate_lat <> '' AND target_item_owner.location_coordinate_lat <> '' THEN 1
            WHEN target_item_owner.location_city = curr_user.location_city THEN 2
            ELSE 3
        END, distance_km DESC, RANDOM()
      LIMIT $${currentCardsIdsArr.length + 2};
    `;

    const result = await pool.query(query, queryArgs);

    const parsedResult = result.rows.map((row: Record<string, string>) => {
      const distanceKm = row.distance_km;
      const ownerLocationCity = row.owner_location_city;

      delete row.distance_km;
      delete row.user_location_lat;
      delete row.user_location_lon;
      delete row.target_location_lat;
      delete row.target_location_lon;
      delete row.current_user_location_city;
      delete row.owner_location_city;

      return { ...row, distanceKm, ownerLocationCity };
    });

    res.json(parsedResult);
  } catch (err) {
    res.status(500).send({ message: 'Server error: ' + err });
  }
};

export const addImage = async (req: AuthRequest, res: Response) => {
  const { fileName, fileContent, itemId } = req.body;
  const { STORAGE_FILES_BASE_URL } = process.env;
  console.log('addImage', fileName, fileContent.length, itemId, STORAGE_FILES_BASE_URL);
  try {
    const currentCountResponse = await pool.query(
      'SELECT COUNT(*) FROM items_images WHERE item_id = $1',
      [itemId]
    );
    const { count } = currentCountResponse.rows[0];
    if (count >= MAX_ITEM_PICTURES) {
      throw new Error('Max number of images reached');
    }
    const storageHandler = new StorageHandler();
    const bucketUrl = await storageHandler.composeBucketUrl('items-images');
    await storageHandler.uploadFile(bucketUrl, fileName, fileContent);
    const url = `${STORAGE_FILES_BASE_URL}/${bucketUrl}/${fileName}`;
    console.log('>>> INSERTING IN DB', itemId, url);
    const result = await pool.query(
      `INSERT INTO items_images(item_id, url) VALUES ($1, $2) RETURNING *`,
      [itemId, url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send({ message: 'Server error: ' + err });
  }
};

export const deleteImage = async (req: AuthRequest, res: Response) => {
  const { itemId, imageUrl } = req.body;

  try {
    const { STORAGE_FILES_BASE_URL } = process.env;
    if (!STORAGE_FILES_BASE_URL) {
      throw new Error('storage base url is missing');
    }
    const storageHandler = new StorageHandler();
    const { bucketId } = await storageHandler.getBucketDataByName(
      await storageHandler.composeBucketUrl('items-images')
    );
    const fileName = imageUrl.split('/').pop();
    if (!fileName) {
      throw new Error('file name not found in url');
    }
    await storageHandler.deleteFile(bucketId, fileName);
    await pool.query('DELETE FROM items_images WHERE item_id = $1 AND url = $2', [
      itemId,
      imageUrl,
    ]);
    res.json({});
  } catch (err) {
    res.status(500).send({ message: 'Server error: ' + err });
  }
};
