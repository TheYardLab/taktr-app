// components/views/GanttView.tsx
import React, { useMemo } from "react";

type Task = {
  id: string;
  name: string;
  startDate?: string; // ISO
  endDate?: string;   // ISO
  status?: "Not Started" | "In Progress" | "Blocked" | "Done" | "Completed";
};

type Props = {
  tasks: Task[];
  dayWidth?: number; // px per day
};

const STATUS_COLOR: Record<Exclude<Task["status"], undefined>, string> = {
  "Not Started": "#9CA3AF",
  "In Progress": "#3B82F6",
  "Blocked": "#EF4444",
  "Done": "#10B981",
  "Completed": "#10B981",
};

const ONE_DAY = 1000 * 60 * 60 * 24;
const stripTime = (d: Date) => {
  const dd = new Date(d);
  dd.setHours(0, 0, 0, 0);
  return dd;
};

export default function GanttView({ tasks, dayWidth = 28 }: Props) {
  const fixed = (tasks || []).map((t) => ({
    ...t,
    status: t.status === "Completed" ? "Done" : (t.status ?? "Not Started"),
  }));

  const { rows, minDay, days } = useMemo(() => {
    const rows = (fixed || [])
      .map((t) => {
        const s = t.startDate ? new Date(t.startDate) : undefined;
        const e = t.endDate ? new Date(t.endDate) : undefined;
        if (!s || !e || isNaN(s.getTime()) || isNaN(e.getTime())) return null;
        const start = stripTime(s);
        const end = stripTime(e);
        return { ...t, start, end };
      })
      .filter(Boolean) as Array<Task & { start: Date; end: Date }>;

    if (!rows.length) return { rows: [], minDay: 0, days: [] as Date[] };

    const min = stripTime(new Date(Math.min(...rows.map((r) => r.start.getTime()))));
    const max = stripTime(new Date(Math.max(...rows.map((r) => r.end.getTime()))));
    const span = Math.max(1, Math.round((max.getTime() - min.getTime()) / ONE_DAY)) + 1;
    const days = Array.from({ length: span }, (_, i) => new Date(min.getTime() + i * ONE_DAY));
    return { rows, minDay: min.getTime(), days };
  }, [fixed]);

  if (!rows.length) return <div className="text-sm text-gray-500">No tasks with valid dates to display.</div>;

  return (
    <div className="w-full overflow-x-auto">
      {/* Header timeline */}
      <div className="sticky top-0 z-10 bg-white">
        <div className="ml-56 flex border-b">
          {days.map((d) => (
            <div
              key={d.toISOString()}
              style={{ width: dayWidth }}
              className="shrink-0 border-r text-center text-[10px] text-gray-500 py-1"
              title={d.toDateString()}
            >
              {d.getMonth() + 1}/{d.getDate()}
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div>
        {rows.map((r) => {
          const leftDays = Math.round((r.start.getTime() - minDay) / ONE_DAY);
          const spanDays = Math.max(1, Math.round((r.end.getTime() - r.start.getTime()) / ONE_DAY) + 1);
          const left = leftDays * dayWidth;
          const width = spanDays * dayWidth;
          const color = STATUS_COLOR[r.status || "Not Started"] || STATUS_COLOR["Not Started"];

          return (
            <div key={r.id} className="relative flex border-b">
              {/* Left label column */}
              <div className="w-56 shrink-0 border-r px-2 py-1">
                <div className="text-sm font-medium truncate">{r.name}</div>
                <div className="text-[11px] text-gray-500">
                  {r.start.toISOString().slice(0, 10)} → {r.end.toISOString().slice(0, 10)}
                </div>
              </div>

              {/* Timeline track */}
              <div className="relative h-10 min-w-max">
                <div
                  className="absolute top-2 h-6 rounded"
                  style={{ left, width, backgroundColor: color }}
                  title={`${r.name} (${r.status ?? "Not Started"})`}
                />
                <div className="flex">
                  {days.map((d) => (
                    <div
                      key={`${r.id}-${d.toISOString()}`}
                      style={{ width: dayWidth }}
                      className="h-10 shrink-0 border-r"
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 pt-3 text-xs text-gray-600">
        {Object.entries(STATUS_COLOR).map(([label, bg]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: bg }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}