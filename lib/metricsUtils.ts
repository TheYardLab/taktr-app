// lib/metricsUtils.ts
import type { Task, Metrics } from './ProjectContext';

/**
 * Generate project metrics from tasks.
 */
export function generateMetrics(tasks: Task[]): Metrics {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const avgDuration =
    totalTasks > 0
      ? tasks.reduce((sum, t) => sum + (t.finishDay - t.startDay), 0) / totalTasks
      : 0;

  return {
    totalTasks,
    completedTasks,
    completionRate,
    avgDuration,
  };
}