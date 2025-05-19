// /pages/api/deleteProject.js

import { db } from './db'; // adjust based on your setup
import { project } from './schema'; // your Drizzle schema
import { eq } from 'drizzle-orm'; // ✅ required for 'where' clause

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId } = req.body;

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  try {
    await db.delete(project).where(eq(project.projectId, projectId));
    return res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Error:', err);
    return res.status(500).json({ error: 'Failed to delete project' });
  }
}