import { db } from './db'; // adjust based on your setup
import { project } from './schema'; // adjust based on your schema file location
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId, newProjectName } = req.body;

  if (!projectId || !newProjectName) {
    return res.status(400).json({ error: 'Project ID and new name are required.' });
  }

  try {
    await db.update(project)
      .set({ projectName: newProjectName })
      .where(eq(project.projectId, projectId));

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error updating project name:', error);
    return res.status(500).json({ error: 'Failed to update project name' });
  }
}
