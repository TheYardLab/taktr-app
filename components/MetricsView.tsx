// components/MetricsView.tsx
import React, { useMemo } from "react";

type Task = {
  id: string;
  name: string;
  status?: "Not Started" | "In Progress" | "Blocked" | "Done" | "Completed";
  startDate?: string;
  endDate?: string;
};

function daysBetween(a?: string, b?: string) {
  if (!a || !b) return null;
  const s = new Date(a).getTime();
  const e = new Date(b).getTime();
  if (Number.isNaN(s) || Number.isNaN(e)) return null;
  const ONE = 1000 * 60 * 60 * 24;
  return Math.max(1, Math.round((e - s) / ONE) + 1);
}

export default function MetricsView({ tasks }: { tasks: Task[] }) {
  const m = useMemo(() => {
    const total = tasks.length;
    const normalized = tasks.map((t) => ({
      ...t,
      status: t.status === "Completed" ? "Done" : (t.status ?? "Not Started"),
    }));

    const byStatus: Record<string, number> = {
      "Not Started": 0,
      "In Progress": 0,
      "Blocked": 0,
      "Done": 0,
    };

    let durations: number[] = [];
    for (const t of normalized) {
      byStatus[t.status!] = (byStatus[t.status!] ?? 0) + 1;
      const d = daysBetween(t.startDate, t.endDate);
      if (d) durations.push(d);
    }

    const avgDuration = durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

    const completionRate = total ? Math.round((byStatus["Done"] / total) * 100) : 0;

    return { total, byStatus, avgDuration, completionRate };
  }, [tasks]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card label="Total Tasks" value={m.total} />
      <Card label="Done" value={m.byStatus["Done"]} />
      <Card label="In Progress" value={m.byStatus["In Progress"]} />
      <Card label="Blocked" value={m.byStatus["Blocked"]} />
      <Card label="Avg Duration (days)" value={m.avgDuration} />
      <Card label="Completion (%)" value={`${m.completionRate}%`} />
    </div>
  );
}

function Card({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded border p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}