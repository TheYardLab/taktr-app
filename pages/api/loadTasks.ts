import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectId } = req.query;
    if (!projectId || typeof projectId !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid projectId' });
    }

    const tasksCol = collection(db, 'projects', projectId, 'tasks');
    const snapshot = await getDocs(tasksCol);

    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({ tasks });
  } catch (err: any) {
    console.error('Error loading tasks:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}