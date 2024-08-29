import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { DB_HOST, DB_USER, DB_NAME, DB_PASSWORD, ENV_ID } = process.env;

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || ''),
  ssl:
    ENV_ID === 'PROD'
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
});

(async () => {
  // didn't work without this
  console.log('testing database connection...');
  await pool.connect();
  console.log('database connection works!');
})();

export default pool;
