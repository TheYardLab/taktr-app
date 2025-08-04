'use client';

import React from 'react';
import { useProject } from '@/lib/ProjectContext';

export default function TaskSidebar({ taskIndex, onClose }: { taskIndex: number; onClose: () => void }) {
  const { tasks } = useProject();
  const task = tasks[taskIndex];

  if (!task) return null;

  return (
    <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg p-4 z-50">
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700 mb-4">Close</button>
      <h3 className="text-lg font-semibold mb-2">{task.label}</h3>
      <p className="text-sm text-gray-600 mb-2">{task.trade}</p>
      <p className="text-sm">Start: Day {task.startDay}</p>
      <p className="text-sm">Finish: Day {task.finishDay}</p>
      {task.notes && <p className="text-sm mt-2 italic">{task.notes}</p>}
    </div>
  );
}