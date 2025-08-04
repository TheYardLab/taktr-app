'use client';

import React, { useMemo } from 'react';
import { useProject } from '@/lib/ProjectContext';

export default function Metrics() {
  const { tasks } = useProject();

  const { totalTasks, avgDuration, tasksByTrade } = useMemo(() => {
    const total = tasks.length;
    const avg = total > 0 ? tasks.reduce((sum, t) => sum + (t.duration || 0), 0) / total : 0;
    const tradeCount: Record<string, number> = {};

    tasks.forEach((t) => {
      tradeCount[t.trade] = (tradeCount[t.trade] || 0) + 1;
    });

    return {
      totalTasks: total,
      avgDuration: avg.toFixed(1),
      tasksByTrade: tradeCount,
    };
  }, [tasks]);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">📊 Metrics</h2>
      <p>Total Tasks: {totalTasks}</p>
      <p>Average Duration: {avgDuration} days</p>
      <h3 className="font-semibold mt-4">Tasks by Trade:</h3>
      <ul className="list-disc ml-6">
        {Object.entries(tasksByTrade).map(([trade, count]) => (
          <li key={trade}>{trade}: {count}</li>
        ))}
      </ul>
    </div>
  );
}