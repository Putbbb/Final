import { db } from './db'; 
import { project } from './schema'; 
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectId, projectData, projectName } = req.body;

    if (!projectId || !projectData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await db
      .update(project) // ✅ now matches your schema
      .set({
        projectData: projectData,
        projectName: projectName || 'Untitled',
      })
      .where(eq(project.projectId, projectId));

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Save failed:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}