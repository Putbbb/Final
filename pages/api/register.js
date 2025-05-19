import { db } from './db';
import { account } from './schema';
import { eq } from 'drizzle-orm/expressions';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { fullname, email, password } = req.body;

  if (!fullname || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await db
      .select()
      .from(account)
      .where(eq(account.businessEmail, email))
      .then(rows => rows[0]);

    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    await db.insert(account).values({
      fullname,
      businessEmail: email,
      password, 
    });

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
