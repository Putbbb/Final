// pages/api/keywords.js
import { db } from './db';
import { keyword } from './schema';

export default async (req, res) => {
  try {
    const keywords = await db.select().from(keyword);
    res.status(200).json({ keywords });
  } catch (error) {
    console.error('Error fetching keywords:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
