'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from '@/lib/ProjectContext';
import type { Task } from '@/lib/ProjectContext';
import { generateSCurve } from '@/lib/scurveUtils';
import TaskSidebar from './TaskSidebar';

export default function TaktPlan() {
  const { tasks, setTasks, setSCurve } = useProject();
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null);

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const scurvePoints = generateSCurve(tasks);
      setSCurve(scurvePoints);
    }
  }, [tasks, setSCurve]);

  const handleTaskClick = (index: number) => setSelectedTaskIndex(index);
  const closeSidebar = () => setSelectedTaskIndex(null);

  return (
    <div className="bg-white p-4 rounded shadow relative">
      <h2 className="text-lg font-semibold mb-4">📅 Takt Plan</h2>
      <div className="grid grid-cols-1 gap-2">
        {tasks.length === 0 ? (
          <p className="text-gray-500">No tasks scheduled yet.</p>
        ) : (
          tasks.map((task: Task, index) => (
            <div
              key={index}
              className="border p-2 rounded cursor-pointer hover:bg-gray-50"
              onClick={() => handleTaskClick(index)}
            >
              <p className="text-sm font-semibold">{task.label}</p>
              <p className="text-xs text-gray-500">
                {task.trade} — Day {task.startDay} to Day {task.finishDay}
              </p>
            </div>
          ))
        )}
      </div>

      {selectedTaskIndex !== null && (
        <TaskSidebar taskIndex={selectedTaskIndex} onClose={closeSidebar} />
      )}
    </div>
  );
}