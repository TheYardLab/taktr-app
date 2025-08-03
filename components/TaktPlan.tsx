'use client';

import React, { useEffect, useState } from 'react';
import { useProject, Task } from '@/lib/ProjectContext';
import { calculateSCurve } from '@/lib/scurveUtils'; // ✅ Correct import
import TaskSidebar from './TaskSidebar';

export default function TaktPlan() {
  const { scheduleData, setSCurve } = useProject();
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null);

  useEffect(() => {
    if (scheduleData.length > 0) {
      const scurvePoints = calculateSCurve(scheduleData); // ✅ Updated function call
      setSCurve(scurvePoints);
    }
  }, [scheduleData, setSCurve]);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">📊 Takt Plan</h2>

      <div className="grid grid-cols-1 gap-2">
        {scheduleData.map((task: Task, index: number) => (
          <div
            key={index}
            className="flex justify-between items-center p-2 border rounded cursor-pointer hover:bg-gray-100"
            onClick={() => setSelectedTaskIndex(index)}
          >
            <span className="font-medium">{task.label}</span>
            <span className="text-sm text-gray-600">
              {String(task.start)} → {String(task.finish)}
            </span>
          </div>
        ))}
      </div>

      {selectedTaskIndex !== null && (
        <TaskSidebar
          taskIndex={selectedTaskIndex}
          onClose={() => setSelectedTaskIndex(null)}
        />
      )}
    </div>
  );
}