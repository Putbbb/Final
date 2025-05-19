import { db } from './db';
import { project } from './schema';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  const { projectId } = req.query;

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required.' });
  }

  try {
    const result = await db.select().from(project).where(eq(project.projectId, parseInt(projectId)));
    if (result.length > 0) {
      return res.status(200).json(result[0]);
    } else {
      return res.status(404).json({ error: 'Project not found.' });
    }
  } catch (err) {
    console.error('❌ Error fetching project:', err);
    return res.status(500).json({ error: 'Database error' });
  }
}