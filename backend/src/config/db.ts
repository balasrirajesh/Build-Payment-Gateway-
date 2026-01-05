import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create a connection pool (similar to HikariCP in Spring Boot)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Event listener for errors (prevents app crash on idle client loss)
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export const getClient = () => pool.connect();