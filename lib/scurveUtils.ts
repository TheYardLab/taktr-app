import { Task, SCurvePoint } from './ProjectContext';

export function generateSCurve(tasks: Task[]): SCurvePoint[] {
  const points: SCurvePoint[] = [];
  let cumulativeProgress = 0;

  tasks.forEach(task => {
    cumulativeProgress += task.duration || 0;
    points.push({
      day: task.startDay || 0,
      progress: task.duration,
      cumulative: cumulativeProgress // ✅ This now matches SCurvePoint
    });
  });

  return points;
}