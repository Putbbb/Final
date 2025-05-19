import { db } from './db';
import { project } from './schema';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = parseInt(session.user.id, 10);
  if (!userId) {
    return res.status(400).json({ error: 'User ID is invalid' });
  }

  try {
    console.log(`📌 Fetching projects for UserID: ${userId}`);

    const projects = await db
  .select()
  .from(project)
  .where(eq(project.userId, userId));

const formattedProjects = projects.map((p) => ({
  project_id: p.projectId, // ✅ Rename for frontend
  user_id: p.userId,
  project_name: p.projectName || "Unnamed Project", // ✅ Ensure name is never undefined
  creation_date: p.creationDate,
}));

console.log("✅ API Sending Projects:", JSON.stringify(formattedProjects, null, 2)); 

return res.status(200).json({ projects: formattedProjects });



  } catch (error) {
    console.error('❌ Database Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
