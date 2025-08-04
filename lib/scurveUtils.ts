import type { Task, SCurvePoint } from './ProjectContext';

export function generateSCurve(tasks: Task[]): SCurvePoint[] {
  let cumulative = 0;
  const points: SCurvePoint[] = [];

  tasks.forEach(task => {
    cumulative += 100 / tasks.length;
    points.push({
      day: task.finishDay || task.startDay,
      progress: Math.min(100, (cumulative / 100) * 100),
      cumulative
    });
  });

  return points;
}