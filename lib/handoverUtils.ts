export function detectHandovers(tasks: any[]) {
  return tasks.map((task, i) => {
    if (i < tasks.length - 1) {
      return {
        from: task.label,
        to: tasks[i + 1].label,
        day: task.startDay + task.duration
      };
    }
    return null;
  }).filter(Boolean);
}