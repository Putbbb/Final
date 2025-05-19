// /api/shareWorkspace.js
import { db } from './db';
import { sharedWorkspace } from './schema';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, projectId, shareName } = req.body;

  if (!userId ||  !projectId ||  !shareName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await db.insert(sharedWorkspace).values({
      userId,
      projectId,
      shareName,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Share Workspace Failed:', err);
    res.status(500).json({ error: 'Failed to share project' });
  }
}