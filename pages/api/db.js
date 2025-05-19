// pages/api/db.js
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

console.log('Environment Variable NEONDB_URL:', process.env.NEONDB_URL); // Debug statement

const connectionString = process.env.NEONDB_URL;


if (!connectionString) {
  throw new Error('No database connection string was provided to `neon()`. Perhaps an environment variable has not been set?');
}

// Initialize your database connection here
const sql = neon(connectionString);
export const db = drizzle(sql);
