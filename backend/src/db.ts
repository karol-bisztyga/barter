import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { DB_CONNECTION_URL, ENV_ID } = process.env;

const pool = new Pool({
  connectionString: DB_CONNECTION_URL,
  ssl:
    ENV_ID === 'PROD'
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
});

(async () => {
  // didn't work without this
  if (!DB_CONNECTION_URL) {
    throw new Error('Environment variables not set');
  }
  console.log(`testing evn variables [${!!DB_CONNECTION_URL}]`);
  console.log('testing database connection...');
  await pool.connect();
  console.log('database connection works!');
})();

export default pool;
