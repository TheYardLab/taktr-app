// lib/scurveUtils.ts
import type { Task, SCurvePoint } from './ProjectContext';

/**
 * Generate an S-Curve (progress over time).
 */
export function generateSCurve(tasks: Task[]): SCurvePoint[] {
  const points: SCurvePoint[] = [];
  let cumulativeProgress = 0;

  tasks.forEach(task => {
    const dailyProgress = task.progress || 0;
    cumulativeProgress += dailyProgress;
    points.push({
      day: task.startDay,
      progress: dailyProgress,
      cumulative: cumulativeProgress,
    });
  });

  return points;
}