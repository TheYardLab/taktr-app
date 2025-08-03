import React from 'react';
import { useProject } from '@/lib/ProjectContext';

interface TaskSidebarProps {
  taskIndex: number;
  onClose: () => void;
}

export default function TaskSidebar({ taskIndex, onClose }: TaskSidebarProps) {
  const { scheduleData } = useProject();
  const task = scheduleData[taskIndex];

  if (!task) return null;

  return (
    <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg p-4 z-50 overflow-y-auto">
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h2 className="text-lg font-semibold">Task Details</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
          ✕
        </button>
      </div>
      <div className="space-y-2">
        <p><strong>Label:</strong> {task.label}</p>
        <p><strong>Trade:</strong> {task.trade}</p>
        <p><strong>Start:</strong> {String(task.start)}</p>
        <p><strong>Finish:</strong> {String(task.finish)}</p>
        <p><strong>Duration:</strong> {task.duration} days</p>
      </div>
    </div>
  );
}