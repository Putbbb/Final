import { db } from './db';
import { sharedWorkspace, project } from './schema';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  const { share_id } = req.query;

  if (!share_id) return res.status(400).json({ error: 'Missing share_id' });

  try {
    const result = await db
      .select({
        projectData: project.projectData,
        projectName: project.projectName,
      })
      .from(sharedWorkspace)
      .innerJoin(project, eq(sharedWorkspace.projectId, project.projectId))
      .where(eq(sharedWorkspace.shareId, Number(share_id)));  // ✅ correct

    if (!result.length) {
      return res.status(404).json({ error: 'Shared project not found' });
    }

    return res.status(200).json(result[0]);
  } catch (err) {
    console.error('❌ Error loading shared project:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}