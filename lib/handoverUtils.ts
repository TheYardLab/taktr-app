import type { Task, Handover } from './ProjectContext';

export function detectHandovers(tasks: Task[]): Handover[] {
  const handovers: Handover[] = [];

  for (let i = 0; i < tasks.length - 1; i++) {
    const current = tasks[i];
    const next = tasks[i + 1];

    if (current.trade !== next.trade) {
      handovers.push({
        fromTrade: current.trade,
        toTrade: next.trade,
        zone: 'Default Zone',
        day: current.finishDay
      });
    }
  }

  return handovers;
}