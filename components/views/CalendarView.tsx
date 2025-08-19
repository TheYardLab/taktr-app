// components/views/CalendarView.tsx
import React, { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

type Task = {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  status?: string;
};

type Props = {
  tasks: Task[];
};

export default function CalendarView({ tasks = [] }: Props) {
  const [cursor, setCursor] = useState<Date>(() => startOfMonth(new Date()));

  const { days, monthStart, monthEnd } = useMemo(() => {
    const monthStart = startOfMonth(cursor);
    const monthEnd = endOfMonth(cursor);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
    return { days, monthStart, monthEnd };
  }, [cursor]);

  function tasksOn(day: Date) {
    return tasks.filter((t) => {
      const s = t.startDate ? new Date(t.startDate) : undefined;
      const e = t.endDate ? new Date(t.endDate) : undefined;
      if (!s && !e) return false;
      if (s && e) return isSameDay(day, s) || isSameDay(day, e) || (day >= s && day <= e);
      if (s) return isSameDay(day, s);
      if (e) return isSameDay(day, e);
      return false;
    });
  }

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium">{format(cursor, "MMMM yyyy")}</div>
        <div className="flex gap-2">
          <button
            className="rounded border px-2 py-1 text-sm hover:bg-neutral-50"
            onClick={() => setCursor((d) => subMonths(d, 1))}
          >
            ◀ Prev
          </button>
          <button
            className="rounded border px-2 py-1 text-sm hover:bg-neutral-50"
            onClick={() => setCursor(startOfMonth(new Date()))}
          >
            Today
          </button>
          <button
            className="rounded border px-2 py-1 text-sm hover:bg-neutral-50"
            onClick={() => setCursor((d) => addMonths(d, 1))}
          >
            Next ▶
          </button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 text-center text-xs text-neutral-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Month grid (contained; no fixed/absolute heights) */}
      <div className="grid grid-cols-7 gap-px rounded border bg-neutral-200">
        {days.map((day) => {
          const inMonth = isSameMonth(day, monthStart);
          const list = tasksOn(day).slice(0, 3); // cap for compact view
          return (
            <div key={day.toISOString()} className="min-h-[96px] bg-white p-1">
              <div className={`text-right text-xs ${inMonth ? "text-neutral-900" : "text-neutral-400"}`}>
                {format(day, "d")}
              </div>
              <div className="mt-1 space-y-1">
                {list.map((t) => (
                  <div
                    key={t.id}
                    className="truncate rounded px-1 py-[2px] text-[11px]"
                    style={{ background: "#eef2ff" }}
                    title={`${t.name}${t.status ? ` • ${t.status}` : ""}`}
                  >
                    {t.name}
                  </div>
                ))}
                {tasksOn(day).length > 3 && (
                  <div className="truncate rounded bg-neutral-100 px-1 py-[2px] text-[10px] text-neutral-600">
                    +{tasksOn(day).length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}