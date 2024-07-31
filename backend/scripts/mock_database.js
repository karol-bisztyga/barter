const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const { generateUserData } = require("./userMocker");
require("dotenv").config();

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
          console.log(
            "rerolling...",
            i,
            rollCount,
            newUser.name,
            newUser.email
          );
        }
        newUser = generateUserData();
        isDuplicate = users.some(
          (user) => user.email === newUser.email || user.name === newUser.name
        );
        ++rollCount;
      }
      users.push(newUser);
    }

    for (let user of users) {
      const { name, email, phone, facebook, instagram, password } = user;

      const hashedPassword = await bcrypt.hash(password, 10);

      console.log(
        `> inserting: [${name}][${email}][${phone}][${facebook}][${instagram}][${hashedPassword}]`
      );

      await client.query(
        "INSERT INTO users (name, email, phone, facebook, instagram, password) VALUES ($1, $2, $3, $4, $5, $6)",
        [name, email, phone, facebook, instagram, hashedPassword]
      );
    }
    console.log();
    console.log("Sample users inserted successfully:");
    for (let user of users) {
      console.log(user.email, user.password);
    }

    client.release();
  } catch (err) {
    console.error("Error inserting sample users:", err);
  } finally {
    await pool.end();
  }
};

insertSampleUsers();
