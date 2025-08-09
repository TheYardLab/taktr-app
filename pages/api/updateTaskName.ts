// pages/api/updateTaskName.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from "@/lib/firebase";

const db = getFirestore(app);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { id, name } = req.body;

    console.log('Received payload:', { id, name });

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing task ID' });
    }

    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Invalid or missing task name' });
    }

    const taskRef = doc(db, 'tasks', id);

    try {
      await updateDoc(taskRef, { name });
    } catch (updateError) {
      console.error(`Error updating task with ID ${id}:`, updateError);
      return res.status(404).json({ error: 'Task not found or update failed' });
    }

    return res.status(200).json({ success: true, updatedTask: { id, name } });
  } catch (error) {
    console.error('Error updating task name:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}