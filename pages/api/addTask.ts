// pages/api/addTask.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectId, task } = req.body;

    if (!projectId || !task) {
      return res.status(400).json({ error: 'Missing projectId or task' });
    }

    // Ensure task object has required defaults
    const taskData = {
      name: task.name?.trim() || 'Unnamed Task',
      startDate: task.startDate ? Timestamp.fromDate(new Date(task.startDate)) : null,
      endDate: task.endDate ? Timestamp.fromDate(new Date(task.endDate)) : null,
      dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
      assignedTo: task.assignedTo || null,
      status: task.status || 'Pending',
      notes: task.notes || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const tasksCol = collection(db, 'projects', projectId, 'tasks');
    const newDoc = await addDoc(tasksCol, taskData);

    res.status(200).json({ id: newDoc.id, task: taskData, message: 'Task added successfully' });
  } catch (err: any) {
    console.error('Error adding task:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}