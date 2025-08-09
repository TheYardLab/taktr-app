// pages/api/updateTask.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed. Use PATCH instead.' });
  }

  try {
    const { projectId, taskId, updates } = req.body;
    if (!projectId || !taskId || !updates) {
      return res.status(400).json({ error: 'Missing projectId, taskId, or updates in request body' });
    }

    // Basic input validation
    if (updates.name && typeof updates.name !== 'string') {
      return res.status(400).json({ error: 'Task name must be a string' });
    }
    if (updates.startDate && isNaN(Date.parse(updates.startDate))) {
      return res.status(400).json({ error: 'Invalid startDate format' });
    }
    if (updates.endDate && isNaN(Date.parse(updates.endDate))) {
      return res.status(400).json({ error: 'Invalid endDate format' });
    }

    const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
    const taskSnap = await getDoc(taskRef);

    if (!taskSnap.exists()) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await updateDoc(taskRef, updates);

    // Return updated task
    const updatedSnap = await getDoc(taskRef);
    res.status(200).json({ message: 'Task updated successfully', task: { id: taskId, ...updatedSnap.data() } });
  } catch (err: any) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}