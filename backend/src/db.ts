import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { ENV_ID, DB_CONNECTION_URL, DB_USER, DB_HOST, DB_NAME, DB_PASSWORD } = process.env;

let maybePpool: Pool | undefined;
if (ENV_ID === 'LOCAL') {
  maybePpool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || ''),
  });
} else if (ENV_ID === 'PROD') {
  maybePpool = new Pool({
    connectionString: DB_CONNECTION_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}
if (!maybePpool) {
  throw new Error(`there is no database config for provided environment id: ${ENV_ID}`);
}
const pool = maybePpool;

(async () => {
  // didn't work without this
  if (!pool) {
    throw new Error('Database connection failed');
  }
  console.log(`testing evn variables [${ENV_ID}]`);
  console.log('testing database connection...');
  await pool.connect();
  console.log('database connection works!');
})();

export default pool;
