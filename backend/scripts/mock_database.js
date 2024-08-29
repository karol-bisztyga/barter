const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { generateUserData } = require('./userMocker');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { generateItem } = require('./itemsMocker');
const { uploadRandomImageLocal } = require('./setup_storage');
const { uploadRandomImageB2, authenticate } = require('./backblaze_functions');

const { DB_HOST, DB_USER, DB_NAME, DB_PASSWORD, DB_PORT, BUCKET_SUFFIX, ENV_ID } = process.env;
const MAX_ITEM_PICTURES = 5;

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: DB_PORT,
  ssl:
    ENV_ID === 'PROD'
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
});

switch (ENV_ID) {
  case 'LOCAL':
    uploadRandomImage = uploadRandomImageLocal;
    break;
  case 'PROD':
    uploadRandomImage = uploadRandomImageB2;
    break;
  default:
    throw new Error('Invalid ENV_ID', ENV_ID);
}

const composeBucketUrl = (bucketName) => {
  return `${bucketName}-${BUCKET_SUFFIX}`;
};

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
      const { name, email, phone, facebook, instagram, profilePicture, password, location } =
        users[i];

      const hashedPassword = await bcrypt.hash(password, 10);

      console.log(
        `> inserting: [${name}][${email}][${phone}][${facebook}][${instagram}][${profilePicture}][${hashedPassword}]`
      );

      const result = await client.query(
        `
        INSERT INTO
            users (name, email, phone, facebook, instagram, profile_picture, password, location)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING
            id
        `,
        [name, email, phone, facebook, instagram, profilePicture, hashedPassword, location]
      );
      const matchUpdatesResult = await client.query(
        `
        INSERT INTO
            matches_updates (user_id, date_updated)
        VALUES
            ($1, $2)
        RETURNING *
        `,
        [result.rows[0].id, 0]
      );
      console.log('inserted match updates', matchUpdatesResult.rows);
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

const generateMockedImageUrls = async (itemId) => {
  const amount = Math.floor(Math.random() * MAX_ITEM_PICTURES) + 1;
  const result = [];
  for (let i = 0; i < amount; ++i) {
    const url = await uploadRandomImage(
      composeBucketUrl('items-images'),
      `item-image-${itemId}-${i}.jpg`
    );
    result.push(url);
    console.log('uploaded image for item', itemId, url);
  }
  return result;
};

const generateSampleImages = async (items) => {
  const images = {};
  for (let i = 0; i < items.length; ++i) {
    const item = items[i];
    images[item.id] = await generateMockedImageUrls(item.id);
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
      profilePicture: await uploadRandomImage(
        composeBucketUrl('profile-pictures'),
        'profile-pic-1.jpg'
      ),
      password: 'testowehaslo111',
      location: '50.067570, 19.917868',
    },
    {
      name: 'Testowy Drugi',
      email: 'testowydrugi@gmail.com',
      phone: '987654321',
      facebook: 'tojatestowy2',
      instagram: 'testowy22',
      profilePicture: null,
      password: 'testowehaslo222',
      location: '50.066331, 19.928390',
    },
    {
      name: 'Testowy Trzeci',
      email: 'testowytrzeci@gmail.com',
      phone: '111222333',
      facebook: null,
      instagram: null,
      profilePicture: await uploadRandomImage(
        composeBucketUrl('profile-pictures'),
        'profile-pic-3.jpg'
      ),
      password: 'testowehaslo333',
      location: '50.067143, 20.052357',
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
      profilePicture: await uploadRandomImage(
        composeBucketUrl('profile-pictures'),
        'profile-pic-5.jpg'
      ),
      password: 'testowehaslo555',
      location: 'Krakow, Poland',
    },
    {
      name: 'Karol B',
      email: 'karolbisztyga@gmail.com',
      phone: '000000000',
      facebook: null,
      instagram: null,
      profilePicture: null,
      password: 'admin123456',
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
      const dateUpdated = Date.now();
      const queryResult = await client.query(
        'INSERT INTO matches (matching_item_id, matched_item_id) VALUES ($1, $2) RETURNING *',
        [match.matching_item_id, match.matched_item_id]
      );
      const matchesUpdatesResult = await client.query(
        `
        UPDATE
            matches_updates
        SET
            date_updated = $1
        WHERE
            user_id IN (SELECT user_id FROM items WHERE id = $2 OR id = $3)
        RETURNING *`,
        [dateUpdated, match.matching_item_id, match.matched_item_id]
      );
      console.log('>>> matchesUpdatesResult', matchesUpdatesResult.rows);
      matchesResult.push(queryResult.rows[0]);
    }
    await client.release();
    return matchesResult;
  } catch (err) {
    throw new Error('Error inserting hardcoded matches: [' + err + ']');
  }
};

const insertHarcodedMessages = async () => {
  const messages = [
    {
      authorId: 1,
      matchId: 3,
      content: `Hey Jamie, I noticed you have a blender you're looking to trade. I have a set of kitchen knives that I don't use much. Would you be interested in swapping?`,
    },
    {
      authorId: 3,
      matchId: 3,
      content: `Hi Alex! Yeah, I'm definitely open to that. The blender's in really good condition, I just don't need it anymore. What kind of knives do you have?`,
    },
    {
      authorId: 1,
      matchId: 3,
      content: `It's a five-piece stainless steel set with a chef's knife, a paring knife, a bread knife, and a couple of utility knives. They're almost new—I just prefer my other set.`,
    },
    {
      authorId: 3,
      matchId: 3,
      content: `That sounds perfect. I've been meaning to upgrade my knife set, so this could work out great. The blender is about a year old, but I've only used it a handful of times. It's still powerful and blends everything smoothly.`,
    },
    {
      authorId: 1,
      matchId: 3,
      content: `Awesome, that sounds ideal! I've been wanting a blender for smoothies and soups. Does it come with any extra attachments?`,
    },
    {
      authorId: 3,
      matchId: 3,
      content: `Yeah, it comes with a couple of different blades and a smaller cup for making single servings. All the parts are in great shape, and I've kept everything clean and well-maintained.`,
    },
    {
      authorId: 1,
      matchId: 3,
      content: `That's good to hear. I think the knives will be a nice upgrade for you too. They've got a good weight to them, and they stay sharp for a long time.`,
    },
    {
      authorId: 3,
      matchId: 3,
      content: `I'm definitely excited to try them out. I've been using the same old knives for years, so it'll be a nice change. When do you think we can meet to make the exchange?`,
    },
    {
      authorId: 1,
      matchId: 3,
      content: `How does tomorrow evening sound? I'm usually free after 6 PM.`,
    },
    {
      authorId: 3,
      matchId: 3,
      content: `Tomorrow evening works for me too. Do you want to meet somewhere in between? I'm on the west side of town.`,
    },
    {
      authorId: 1,
      matchId: 3,
      content: `I'm on the east side, but I don't mind meeting halfway. How about the park near Main Street? It's pretty central and usually not too busy in the evenings.`,
    },
    { authorId: 3, matchId: 3, content: `That sounds good to me. How about we meet at 6:30 PM?` },
    {
      authorId: 1,
      matchId: 3,
      content: `Perfect. I'll bring the knife set with me. Should I look out for anything specific when I'm picking up the blender?`,
    },
    {
      authorId: 3,
      matchId: 3,
      content: `Just make sure the blades and the cup are there. I'll have everything packed up in the original box, so it should be easy to spot. Anything I need to know about the knives?`,
    },
    {
      authorId: 1,
      matchId: 3,
      content: `Nope, they're all in excellent condition. Just make sure you get a good feel for them when we meet. They have a nice balance, and I think you'll like the grip.`,
    },
    {
      authorId: 3,
      matchId: 3,
      content: `Sounds great! I'm really looking forward to the trade. This is going to be a win-win for both of us, I think.`,
    },
    {
      authorId: 1,
      matchId: 3,
      content: `I agree! I've been searching for a good blender for a while now, and this seems like the perfect match. Glad we could work something out.`,
    },
    {
      authorId: 3,
      matchId: 3,
      content: `Me too! It's always nice to find someone who needs what you have and has what you need. I'll see you tomorrow at 6:30 PM at the park near Main Street.`,
    },
    { authorId: 1, matchId: 3, content: `Exactly! Looking forward to it. See you then, Jamie!` },
    { authorId: 3, matchId: 3, content: `See you tomorrow, Alex! Don't forget the knives!` },
    { authorId: 1, matchId: 3, content: `And you don't forget the blender! 😊` },
    { authorId: 3, matchId: 3, content: `Haha, I won't! Have a great night, Alex.` },
    { authorId: 1, matchId: 3, content: `You too, Jamie! Take care.` },
  ];

  try {
    const client = await pool.connect();
    const result = [];
    for (let message of messages) {
      const { authorId, content, matchId } = message;
      const queryResult = await client.query(
        'INSERT INTO messages (sender_id, match_id, message_type, content) VALUES ($1, $2, $3, $4) RETURNING *',
        [authorId, matchId, 'message', content]
      );
      result.push(queryResult.rows[0]);
    }
    await client.release();
    return result;
  } catch (err) {
    throw new Error('Error inserting hardcoded messages: [' + err + ']');
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

  const messages = await insertHarcodedMessages(items);
  console.log('messages', messages);
};

(async () => {
  const command = process.argv.slice(2)[0];

  if (ENV_ID === 'PROD') {
    await authenticate();
  }

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
