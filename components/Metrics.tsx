'use client';

import React from 'react';
import { useProject } from '@/lib/ProjectContext';
import type { Task } from '@/lib/ProjectContext';

export default function Metrics() {
  const { tasks, metrics } = useProject();
  const total = tasks.length;

  const avgDuration =
    total > 0
      ? tasks.reduce((sum: number, t: Task) => sum + (t.duration || 0), 0) / total
      : 0;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">📊 Metrics</h2>
      <p>Total Tasks: {metrics.totalTasks}</p>
      <p>Completed Tasks: {metrics.completedTasks}</p>
      <p>Completion Rate: {metrics.completionRate}%</p>
      <p>Average Task Duration: {avgDuration.toFixed(1)} days</p>
    </div>
  );
}