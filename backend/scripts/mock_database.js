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

const generateSampleImages = async (items) => {
  const images = {};
  for (let i = 0; i < items.length; ++i) {
    const item = items[i];
    images[item.id] = await generateMockedImageUrls();
  }
  return images;
};

const insertSampleImages = async (items, hardcodedImages = {}) => {
  const client = await pool.connect();
  const images = Object.keys(hardcodedImages).length
    ? hardcodedImages
    : await generateSampleImages(items);
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
      profilePicture: 'https://picsum.photos/id/534/500/360',
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
    {
      name: 'Testowy Trzeci',
      email: 'testowytrzeci@gmail.com',
      phone: '111222333',
      facebook: null,
      instagram: null,
      profilePicture: 'https://picsum.photos/id/195/400/300',
      password: 'testowehaslo333',
    },
    {
      name: 'Testowy Czwarty',
      email: 'testowyczwarty@gmail.com',
      phone: '444555666',
      facebook: 'testowyy4',
      instagram: 'testowy44',
      profilePicture: null,
      password: 'testowehaslo444',
    },
    {
      name: 'Testowy Piąty',
      email: 'testowypiaty@gmail.com',
      phone: '777333999',
      facebook: null,
      instagram: 'testowy55555',
      profilePicture: 'https://picsum.photos/id/943/200',
      password: 'testowehaslo555',
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
    {
      userId: 3,
      name: 'Testowy przedmiot 3-1',
      description: 'Opis testowego przedmiotu 3-1',
    },
    {
      userId: 3,
      name: 'Testowy przedmiot 3-2',
      description: 'Opis testowego przedmiotu 3-2',
    },
    {
      userId: 3,
      name: 'Testowy przedmiot 3-3',
      description: 'Opis testowego przedmiotu 3-3',
    },
    {
      userId: 4,
      name: 'Testowy przedmiot 4-1',
      description: 'Opis testowego przedmiotu 4-1',
    },
    {
      userId: 4,
      name: 'Testowy przedmiot 4-2',
      description: 'Opis testowego przedmiotu 4-2',
    },
    {
      userId: 4,
      name: 'Testowy przedmiot 4-3',
      description: 'Opis testowego przedmiotu 4-3',
    },
    {
      userId: 5,
      name: 'Testowy przedmiot 5-1',
      description: 'Opis testowego przedmiotu 5-1',
    },
    {
      userId: 5,
      name: 'Testowy przedmiot 5-2',
      description: 'Opis testowego przedmiotu 5-2',
    },
    {
      userId: 5,
      name: 'Testowy przedmiot 5-3',
      description: 'Opis testowego przedmiotu 5-3',
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

const insertHardcodedLikes = async (withMatches = false) => {
  /**
   * kazy user ma po 3 przedmioty
   * id itemow usera 1: 1, 2, 3
   * trzeba przetestowac scenariusze:
   *  1. user2 lubi 0 przedmiotow usera1
   *  2. user3 lubi 1 przedmiot usera1
   *  3. user4 lubi 2 przedmioty usera2 ale nie lubi 1 przedmiotu
   *  3. user5 lubi 3 przedmioty usera2
   */
  const likes = [
    {
      userId: 3,
      itemId: 1,
      decision: true,
    },
    {
      userId: 4,
      itemId: 1,
      decision: true,
    },
    {
      userId: 4,
      itemId: 2,
      decision: true,
    },
    {
      userId: 4,
      itemId: 3,
      decision: false,
    },
    {
      userId: 5,
      itemId: 1,
      decision: true,
    },
    {
      userId: 5,
      itemId: 2,
      decision: true,
    },
    {
      userId: 5,
      itemId: 3,
      decision: true,
    },
  ];
  if (withMatches) {
    likes.push(
      {
        userId: 1,
        itemId: 15, // user 5
        decision: true,
      },
      {
        userId: 1,
        itemId: 10, // user 4
        decision: true,
      },
      {
        userId: 1,
        itemId: 7, // user 3
        decision: true,
      }
    );
  }

  try {
    const client = await pool.connect();
    const likesResult = [];
    for (let like of likes) {
      const queryResult = await client.query(
        'INSERT INTO likes (liker_id, liked_id, decision) VALUES ($1, $2, $3) RETURNING *',
        [like.userId, like.itemId, like.decision]
      );
      likesResult.push(queryResult.rows[0]);
    }
    await client.release();
    return likesResult;
  } catch (err) {
    throw new Error('Error inserting hardcoded likes: [' + err + ']');
  }
};

const insertHardcodedMatches = async () => {
  const matches = [
    {
      matching_item_id: 3,
      matched_item_id: 15,
    },
    {
      matching_item_id: 2,
      matched_item_id: 10,
    },
    {
      matching_item_id: 1,
      matched_item_id: 7,
    },
  ];

  try {
    const client = await pool.connect();
    const matchesResult = [];
    for (let match of matches) {
      const queryResult = await client.query(
        'INSERT INTO matches (matching_item_id, matched_item_id) VALUES ($1, $2) RETURNING *',
        [match.matching_item_id, match.matched_item_id]
      );
      matchesResult.push(queryResult.rows[0]);
    }
    await client.release();
    return matchesResult;
  } catch (err) {
    throw new Error('Error inserting hardcoded matches: [' + err + ']');
  }
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

  const likes = await insertHardcodedLikes(true);
  console.log('hardcoded likes inserted', likes);

  const matches = await insertHardcodedMatches(items);
  console.log('matches', matches);
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
