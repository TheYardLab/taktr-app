import { Task, SCurvePoint } from './ProjectContext';

// ✅ Generates SCurve points based on tasks
export function generateSCurve(tasks: Task[]): SCurvePoint[] {
  const points: SCurvePoint[] = [];
  let cumulativeProgress = 0;

  tasks.forEach((task) => {
    const taskProgress = task.progress ?? 0; // Default to 0 if undefined
    cumulativeProgress += taskProgress;

    points.push({
      day: task.finishDay || task.startDay || 0, // Ensures we capture timeline
      progress: taskProgress,
      cumulative: cumulativeProgress,
    });
  });

  return points;
}