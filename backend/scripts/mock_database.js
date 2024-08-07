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

const generateSampleUsers = (amount = 10) => {
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
  return users;
};

const insertSampleUsers = async (hardcodedUsers = [], amount = 10) => {
  const users = hardcodedUsers.length ? hardcodedUsers : generateSampleUsers(amount);
  try {
    const client = await pool.connect();

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

const generateSampleItems = (users, itemsCount = 10) => {
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

  return items;
};

const insertSampleItems = async (users, hardcodedItems = [], itemsCount = 10) => {
  const items = hardcodedItems.length ? hardcodedItems : generateSampleItems(users, itemsCount);

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

const generateSampleImages = (items) => {
  const images = {};
  for (let i = 0; i < items.length; ++i) {
    const item = items[i];
    images[item.id] = generateMockedImageUrls();
  }
  return images;
};

const insertSampleImages = async (items, hardcodedImages = {}) => {
  const client = await pool.connect();
  const images = Object.keys(hardcodedImages).length
    ? hardcodedImages
    : generateSampleImages(items);
  try {
    for (let i = 0; i < items.length; ++i) {
      const item = items[i];

      for (let j = 0; j < images[item.id].length; ++j) {
        const result = await client.query(
          'INSERT INTO items_images (item_id, url) VALUES ($1, $2) RETURNING id',
          [item.id, images[item.id][j]]
        );
      }
    }
    await client.release();
    return images;
  } catch (err) {
    throw new Error('Error inserting sample images: [' + err + ']');
  }
};

const insertHardcodedUsers = async () => {
  const users = [
    {
      name: 'Testowy Pierwszy',
      email: 'testowypierwszy@gmail.com',
      phone: '123456789',
      facebook: null,
      instagram: 'testowyyy11',
      profilePicture: 'https://picsum.photos/248/201?random=0.43567783413855454',
      password: 'testowehaslo111',
    },
    {
      name: 'Testowy Drugi',
      email: 'testowydrugi@gmail.com',
      phone: '987654321',
      facebook: 'tojatestowy2',
      instagram: 'testowy22',
      profilePicture: null,
      password: 'testowehaslo222',
    },
  ];
  return await insertSampleUsers(users);
};

const insertHardcodedItems = async () => {
  const hardcodedItems = [
    {
      userId: 1,
      name: 'Testowy przedmiot 1-1',
      description: 'Opis testowego przedmiotu 1-1',
    },
    {
      userId: 1,
      name: 'Testowy przedmiot 1-2',
      description: 'Opis testowego przedmiotu 1-2',
    },
    {
      userId: 1,
      name: 'Testowy przedmiot 1-3',
      description: 'Opis testowego przedmiotu 1-3',
    },
    {
      userId: 2,
      name: 'Testowy przedmiot 2-1',
      description: 'Opis testowego przedmiotu 2-1',
    },
    {
      userId: 2,
      name: 'Testowy przedmiot 2-2',
      description: 'Opis testowego przedmiotu 2-2',
    },
    {
      userId: 2,
      name: 'Testowy przedmiot 2-3',
      description: 'Opis testowego przedmiotu 2-3',
    },
  ];

  // users can be empty array as it is not used in this case
  return await insertSampleItems([], hardcodedItems);
};

const insertHardcodedImages = async (items) => {
  // todo for now we do not need specific images for hardcoded items
  // once we do, put urls here
  const hardcodedImages = {
    /* ... */
  };

  return await insertSampleImages(items, hardcodedImages);
};

const mockSampleData = async () => {
  const users = await insertSampleUsers();
  console.log('users', users);
  await writeDataToFile('../mobile/app/(app)/mocks/sampleUsers.json', JSON.stringify(users));

  const items = await insertSampleItems(users);
  console.log('items', items);

  const images = await insertSampleImages(items);
  console.log('images', images);
};

const mockHardcodedData = async () => {
  const users = await insertHardcodedUsers();
  await writeDataToFile('../mobile/app/(app)/mocks/sampleUsers.json', JSON.stringify(users));

  const items = await insertHardcodedItems();
  console.log('hardcoded items inserted', items);

  const images = await insertHardcodedImages(items);
  console.log('hardcoded images inserted', images);
};

(async () => {
  const command = process.argv.slice(2)[0];

  switch (command) {
    case 'sample':
      await mockSampleData();
      break;
    case 'hardcoded':
      await mockHardcodedData();
      break;
    default:
      console.error(`Invalid command: ${command}`);
  }

  await pool.end();
})();
