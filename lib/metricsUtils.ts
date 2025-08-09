import { Task } from "./ProjectContext";

export interface MetricsData {
  name: string;
  value: number;
  plannedValues: number[];
  actualValues: number[];
}

export function calculateVariance(metrics: MetricsData): number[] {
  if (!metrics.plannedValues || !metrics.actualValues) {
    return [];
  }
  return metrics.plannedValues.map((p, i) => p - (metrics.actualValues[i] ?? 0));
}

export function calculateMetrics(tasks: Task[]): MetricsData {
  const plannedValues: number[] = tasks.map((t: Task) => {
    if (typeof (t as any).plannedValues === "number") return (t as any).plannedValues;
    if (typeof (t as any).planned === "number") return (t as any).planned;
    return 0;
  });

  const actualValues: number[] = tasks.map((t: Task) => {
    if (typeof (t as any).actualValues === "number") return (t as any).actualValues;
    if (typeof (t as any).actual === "number") return (t as any).actual;
    return 0;
  });

  return { 
    name: "Project Metrics", 
    value: plannedValues.reduce((a,b)=>a+b,0), 
    plannedValues, 
    actualValues 
  };
}