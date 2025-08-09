// components/views/ListView.tsx
'use client';

import React from 'react';
import { useTasksStore } from '@/components/hooks/useTasksStore';

interface ListViewProps {
  projectId: string;
}

export default function ListView({ projectId }: ListViewProps) {
  const { filteredTasks, loading, error, fetchTasks, setProjectId } = useTasksStore();

  React.useEffect(() => {
    setProjectId(projectId);
    fetchTasks();
    // Cleanup when component unmounts
    return () => {
      setProjectId(null);
    };
  }, [projectId, fetchTasks, setProjectId]);

  if (loading) {
    return <div className="p-4">Loading tasks...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!filteredTasks.length) {
    return <div className="p-4">No tasks found for this project.</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Task List</h2>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Task Name</th>
            <th className="border border-gray-300 p-2">Status</th>
            <th className="border border-gray-300 p-2">Start Date</th>
            <th className="border border-gray-300 p-2">End Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map((task) => (
            <tr key={task.id}>
              <td className="border border-gray-300 p-2">{task.name}</td>
              <td className="border border-gray-300 p-2">{task.status ?? 'Not Started'}</td>
              <td className="border border-gray-300 p-2">{task.startDate ?? '-'}</td>
              <td className="border border-gray-300 p-2">{task.endDate ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}