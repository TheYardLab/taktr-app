// /types/task.ts
export interface Task {
  id: string;
  name: string;
  startDate?: string; // ISO date string
  endDate?: string;   // ISO date string
  status?: string;    // e.g. "In Progress", "Complete"
}