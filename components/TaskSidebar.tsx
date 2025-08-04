'use client';

import React from 'react';
import { useProject } from '../lib/ProjectContext';
import type { Task } from '../lib/ProjectContext';

interface Props {
  taskIndex: number;
  onClose: () => void;
}

export default function TaskSidebar({ taskIndex, onClose }: Props) {
  const { tasks } = useProject();
  const task = tasks[taskIndex] as Task;

  return (
    <div className="fixed right-0 top-0 w-80 h-full bg-white shadow-lg p-4">
      <button onClick={onClose} className="mb-4 text-red-500">Close</button>
      <h3 className="text-lg font-semibold mb-2">{task.label}</h3>
      <p>Trade: {task.trade}</p>
      <p>Duration: {task.duration} days</p>
      <p>Notes: {task.notes || 'None'}</p>
    </div>
  );
}