import { Pool } from 'pg';

// Check if we have a database connection
const hasDatabase = !!process.env.DATABASE_URL;

let pool: Pool | null = null;

if (hasDatabase) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
}

export async function query(text: string, params?: any[]) {
  if (!pool) {
    throw new Error('Database not configured');
  }
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export { pool };
export const isDatabaseConfigured = () =>> hasDatabase;
