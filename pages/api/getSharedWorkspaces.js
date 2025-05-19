
import { db } from './db';
import { sharedWorkspace, project } from './schema';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  try {
    const result = await db
      .select({
        shareId: sharedWorkspace.shareId,
        shareName: sharedWorkspace.shareName,
        projectName: project.projectName,
      })
      .from(sharedWorkspace)
      .innerJoin(project, eq(sharedWorkspace.projectId, project.projectId)); // ✅ NO USER FILTER

    if (!result.length) {
      return res.status(404).json({ error: 'No shared projects found' });
    }

    res.status(200).json({ shared: result });
  } catch (error) {
    console.error("❌ Failed to load shared workspaces:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}