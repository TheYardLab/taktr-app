'use client';

import React from 'react';
import { useProject } from '@/lib/ProjectContext';
import type { Task } from '@/lib/ProjectContext';

interface TaskSidebarProps {
  taskIndex: number;
  onClose: () => void;
}

export default function TaskSidebar({ taskIndex, onClose }: TaskSidebarProps) {
  const { tasks } = useProject();
  const task: Task | undefined = tasks[taskIndex];

  if (!task) return null;

  return (
    <div className="absolute top-0 right-0 w-64 bg-gray-100 shadow-lg h-full p-4">
      <button className="text-red-500 mb-4" onClick={onClose}>
        Close
      </button>
      <h3 className="font-semibold">{task.label}</h3>
      <p className="text-sm text-gray-500">Trade: {task.trade}</p>
      <p className="text-sm">Days: {task.startDay} - {task.finishDay}</p>
      <p className="text-sm">Notes: {task.notes || 'No notes available.'}</p>
    </div>
  );
}