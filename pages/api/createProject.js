import { db } from './db';
import { project } from './schema';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // ✅ STEP 1: Get session
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    console.error('🛑 Error: User not authenticated');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // ✅ STEP 2: Ensure user ID is valid
  const userId = parseInt(session.user.id, 10);
  if (!userId || isNaN(userId)) {
    console.error('⚠️ Error: User ID is invalid:', session.user.id);
    return res.status(400).json({ error: 'User ID is invalid' });
  }

  try {
    console.log(`📌 Creating project for UserID: ${userId}`);

    // ✅ STEP 3: Insert project and return correct fields
    const insertedProject = await db
      .insert(project)
      .values({
        userId,
      projectName: 'untitled',
      creationDate: new Date(),
    })
  .returning({ projectId: project.projectId, projectName: project.projectName }); // ✅ Ensure correct fields

console.log('Inserted Project:', insertedProject); // ✅ Debugging log

if (!insertedProject || insertedProject.length === 0 || !insertedProject[0].projectId) {
  throw new Error('❌ Project ID not returned correctly');
}

const newProject = insertedProject[0]; // ✅ Get first inserted row
return res.status(201).json({
  message: 'Project created successfully',
  project_id: newProject.projectId, // ✅ Ensure frontend receives correct ID
  project_name: newProject.projectName,
});


  } catch (error) {
    console.error('❌ Database Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
