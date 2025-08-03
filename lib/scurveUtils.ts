import { Task, SCurvePoint } from './ProjectContext';

// 🔹 Calculate S-Curve points from tasks
export function calculateSCurve(tasks: Task[]): SCurvePoint[] {
  const points: SCurvePoint[] = [];
  let cumulativeProgress = 0;

  tasks.forEach((task) => {
    const progressValue = task.duration > 0 ? (1 / task.duration) * 100 : 0;
    cumulativeProgress += progressValue;

    points.push({
      day: task.startDay || 0,
      progress: progressValue,
      cumulative: cumulativeProgress, // ✅ Now correctly matches SCurvePoint type
    });
  });

  return points;
}