import type { Task, Metrics } from './ProjectContext';

export function calculateMetrics(tasks: Task[]): Metrics {
  const total = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = total > 0 ? (completedTasks / total) * 100 : 0;
  const avgDuration = total > 0 ? tasks.reduce((sum, t) => sum + (t.duration || 0), 0) / total : 0;

  return {
    totalTasks: total,
    completedTasks,
    completionRate,
    avgDuration
  };
}