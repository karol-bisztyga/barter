import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || ''),
});

(async () => {
  // didn't work without this
  console.log('testing database connection...');
  await pool.connect();
  console.log('database connection works!');
})();

export default pool;
