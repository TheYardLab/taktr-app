'use client';

import React, { useEffect } from 'react';
import { useProject } from '@/lib/ProjectContext';
import { generateSCurve } from '@/lib/scurveUtils';

export default function TaktPlan() {
  const { tasks, setSCurve } = useProject();

  useEffect(() => {
    if (tasks.length > 0) {
      const scurvePoints = generateSCurve(tasks);
      setSCurve(scurvePoints);
    }
  }, [tasks, setSCurve]);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">📊 Takt Plan</h2>
      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks loaded.</p>
      ) : (
        <ul className="divide-y">
          {tasks.map((task, idx) => (
            <li key={idx} className="py-2 flex justify-between">
              <span>{task.label}</span>
              <span className="text-gray-500">
                {task.trade} — Day {task.startDay} to {task.finishDay}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}