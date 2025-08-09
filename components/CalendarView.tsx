// components/CalendarView.tsx
import React, { useMemo, useState } from "react";

type Task = {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  status?: "Not Started" | "In Progress" | "Blocked" | "Done" | "Completed";
};

const ONE_DAY = 1000 * 60 * 60 * 24;

function startOfMonth(d: Date) {
  const x = new Date(d);
  x.setDate(1); x.setHours(0,0,0,0);
  return x;
}
function endOfMonth(d: Date) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + 1, 0); x.setHours(0,0,0,0);
  return x;
}
function isBetween(day: Date, a?: string, b?: string) {
  if (!a || !b) return false;
  const t = day.getTime();
  const s = new Date(a).setHours(0,0,0,0);
  const e = new Date(b).setHours(0,0,0,0);
  return t >= s && t <= e;
}

export default function CalendarView({ tasks }: { tasks: Task[] }) {
  const [anchor, setAnchor] = useState(() => startOfMonth(new Date()));
  const end = endOfMonth(anchor);

  const days = useMemo(() => {
    const span = Math.round((end.getTime() - anchor.getTime()) / ONE_DAY) + 1;
    return Array.from({ length: span }, (_, i) => new Date(anchor.getTime() + i * ONE_DAY));
  }, [anchor, end]);

  const normalized = (tasks || []).map((t) => ({
    ...t,
    status: t.status === "Completed" ? "Done" : (t.status ?? "Not Started"),
  }));

  const color = (s?: string) =>
    s === "Done" ? "bg-emerald-500"
    : s === "In Progress" ? "bg-blue-500"
    : s === "Blocked" ? "bg-red-500"
    : "bg-gray-400";

  return (
    <div>
      {/* Controls */}
      <div className="mb-2 flex items-center gap-2">
        <button
          className="rounded border px-2 py-1"
          onClick={() => {
            const d = new Date(anchor);
            d.setMonth(d.getMonth() - 1);
            setAnchor(startOfMonth(d));
          }}
        >
          ← Prev
        </button>
        <div className="text-sm font-medium">
          {anchor.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </div>
        <button
          className="rounded border px-2 py-1"
          onClick={() => {
            const d = new Date(anchor);
            d.setMonth(d.getMonth() + 1);
            setAnchor(startOfMonth(d));
          }}
        >
          Next →
        </button>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full border text-sm">
          <thead>
            <tr className="bg-gray-50">
              {days.map((d) => (
                <th key={d.toISOString()} className="border px-1 py-1 text-[11px] font-medium">
                  {d.getDate()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {normalized.map((t) => (
              <tr key={t.id} className="h-8">
                {days.map((d) => (
                  <td key={`${t.id}-${d.toISOString()}`} className="border p-0">
                    {isBetween(d, t.startDate, t.endDate) && (
                      <div className={`h-6 ${color(t.status)}`} title={`${t.name} (${t.status})`} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {!normalized.length && (
              <tr>
                <td colSpan={days.length} className="p-3 text-center text-gray-500">
                  No tasks this month
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}