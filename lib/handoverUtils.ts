// lib/handoverUtils.ts
import type { Task, Handover } from './ProjectContext';

/**
 * Generate handovers based on finish of one trade matching start of another.
 */
export function generateHandovers(tasks: Task[]): Handover[] {
  const handovers: Handover[] = [];

  tasks.forEach(taskA => {
    tasks.forEach(taskB => {
      if (taskA.trade !== taskB.trade && taskA.finishDay === taskB.startDay) {
        handovers.push({
          fromTrade: taskA.trade,
          toTrade: taskB.trade,
          zone: taskA.label,
          day: taskA.finishDay,
        });
      }
    });
  });

  return handovers;
}