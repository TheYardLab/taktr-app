import React from 'react';
import { useProject } from '@/lib/ProjectContext';

// 🔹 Props definition
interface TaskSidebarProps {
  taskIndex: number;
  onClose: () => void;
}

export default function TaskSidebar({ taskIndex, onClose }: TaskSidebarProps) {
  const { scheduleData, setScheduleData } = useProject();
  const task = scheduleData[taskIndex];

  const handleChange = (field: keyof typeof task, value: string) => {
    const updatedTasks = [...scheduleData];
    (updatedTasks[taskIndex] as any)[field] = value;
    setScheduleData(updatedTasks);
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg p-4">
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-800 mb-4"
      >
        Close ✖
      </button>

      <h3 className="text-lg font-semibold mb-4">Edit Task</h3>

      {task && (
        <>
          <label className="block mb-2">
            Task Name
            <input
              type="text"
              value={task.label}
              onChange={(e) => handleChange('label', e.target.value)}
              className="border rounded p-1 w-full"
            />
          </label>

          <label className="block mb-2">
            Trade
            <input
              type="text"
              value={task.trade}
              onChange={(e) => handleChange('trade', e.target.value)}
              className="border rounded p-1 w-full"
            />
          </label>

          <label className="block mb-2">
            Duration (Days)
            <input
              type="number"
              value={task.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
              className="border rounded p-1 w-full"
            />
          </label>
        </>
      )}
    </div>
  );
}