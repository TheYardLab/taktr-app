import { Task, SCurvePoint } from './ProjectContext';

export function generateSCurve(tasks: Task[]): SCurvePoint[] {
  const points: SCurvePoint[] = [];
  let cumulative = 0;

  tasks.forEach((task) => {
    cumulative += task.duration;
    points.push({
      day: task.startDay || 0,
      cumulative
    });
  });

  return points;
}