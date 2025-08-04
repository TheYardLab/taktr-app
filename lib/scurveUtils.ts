import type { Task, SCurvePoint } from './ProjectContext';

export function generateSCurve(tasks: Task[]): SCurvePoint[] {
  const points: SCurvePoint[] = [];
  let totalTasks = tasks.length;
  let completed = 0;

  tasks.forEach((task, index) => {
    completed++;
    const progress = (completed / totalTasks) * 100;
    points.push({
      day: task.finishDay || index + 1,
      progress
    });
  });

  return points;
}