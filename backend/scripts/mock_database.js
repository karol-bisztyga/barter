const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { generateUserData } = require('./userMocker');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { generateItem, generateMockedImageUrls } = require('./itemsMocker');

const { DB_HOST, DB_USER, DB_NAME, DB_PASSWORD, DB_PORT } = process.env;

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: DB_PORT,
});

const insertSampleUsers = async (amount = 10) => {
  try {
    const client = await pool.connect();
    const users = [];

    for (let i = 0; i < amount; ++i) {
      let newUser = null;
      let isDuplicate = false;
      let rollCount = 0;
      // name and email have to be unique, check this and reroll if necessary
      while (!newUser || isDuplicate) {
        if (rollCount) {
          console.log('rerolling...', i, rollCount, newUser.name, newUser.email);
        }
        newUser = generateUserData();
        isDuplicate = users.some((user) => user.email === newUser.email);
        ++rollCount;
      }
      users.push(newUser);
    }

    for (let i = 0; i < users.length; ++i) {
      const { name, email, phone, facebook, instagram, profilePicture, password } = users[i];

      const hashedPassword = await bcrypt.hash(password, 10);

      console.log(
        `> inserting: [${name}][${email}][${phone}][${facebook}][${instagram}][${profilePicture}][${hashedPassword}]`
      );

      const result = await client.query(
        'INSERT INTO users (name, email, phone, facebook, instagram, profile_picture, password) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [name, email, phone, facebook, instagram, profilePicture, hashedPassword]
      );
      users[i] = { ...users[i], id: result.rows[0].id };
    }
    console.log('Sample users inserted successfully!');
    await client.release();
    return users;
  } catch (err) {
    throw new Error('Error inserting sample users: [' + err + ']');
  }
};

const writeDataToFile = async (filePath, data) => {
  return new Promise((resolve, reject) => {
    console.log('Writing data to file', filePath);

    fs.writeFile(filePath, data, 'utf8', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve('File written successfully');
      }
    });
  });
};

const insertSampleItems = async (users, itemsCount = 10) => {
  const items = [];

  for (let i = 0; i < itemsCount; ++i) {
    const user = users[Math.floor(Math.random() * users.length)];
    const item = generateItem(user.id);
    items.push(item);
  }

  // TODO REMOVE: ensure every user has at least one item
  users.forEach((user) => {
    if (!items.some((item) => item.userId === user.id)) {
      const item = generateItem(user.id);
      items.push(item);
    }
  });

  try {
    const client = await pool.connect();
    // insert items
    for (let i = 0; i < items.length; ++i) {
      const { userId, name, description } = items[i];

      console.log(`> inserting: [${userId}][${name}][${description}]`);

      const result = await client.query(
        'INSERT INTO items (user_id, name, description) VALUES ($1, $2, $3) RETURNING id',
        [userId, name, description]
      );

      items[i] = {
        ...items[i],
        id: result.rows[0].id,
      };
    }
    console.log('Sample items inserted successfully!');
    await client.release();
    return items;
  } catch (err) {
    throw new Error('Error inserting sample items: [' + err + ']');
  }
};

const insertSampleImages = async (items) => {
  const client = await pool.connect();
  try {
    const images = {};
    for (let i = 0; i < items.length; ++i) {
      const item = items[i];

      images[item.id] = generateMockedImageUrls().map((url) => ({ url }));

      for (let j = 0; j < images[item.id].length; ++j) {
        const result = await client.query(
          'INSERT INTO items_images (item_id, url) VALUES ($1, $2) RETURNING id',
          [item.id, images[item.id][j]]
        );
        images[item.id][j] = { ...images[item.id][j], id: result.rows[0].id };
      }
    }
    await client.release();
    return images;
  } catch (err) {
    throw new Error('Error inserting sample images: [' + err + ']');
  }
};

(async () => {
  const users = await insertSampleUsers();
  console.log('users', users);
  await writeDataToFile('../mobile/app/(app)/mocks/sampleUsers.json', JSON.stringify(users));

  const items = await insertSampleItems(users);
  console.log('items', items);

  const images = await insertSampleImages(items);
  console.log('images', images);

  await pool.end();
})();
