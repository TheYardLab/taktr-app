import React, { useMemo, useRef } from "react";

type Task = {
  id: string;
  name: string;
  startDate?: string; // ISO (YYYY-MM-DD or full ISO)
  endDate?: string;   // ISO
  status?: "Not Started" | "In Progress" | "Blocked" | "Done" | "Completed";
};

type Props = {
  tasks: Task[];
  /** optional YYYY-MM for which month to render; defaults to current month */
  month?: string;
};

function ymd(date: Date) {
  return date.toISOString().slice(0, 10);
}
function strip(d: Date) {
  const x = new Date(d);
  x.setHours(0,0,0,0);
  return x;
}
function parseISOish(v?: string) {
  if (!v) return undefined;
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : strip(d);
}

export default function CalendarView({ tasks, month }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Which month?
  const base = useMemo(() => {
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [y, m] = month.split("-").map(Number);
      return new Date(y, m - 1, 1);
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, [month]);

  // Build month grid (Sun → Sat)
  const { title, days } = useMemo(() => {
    const year = base.getFullYear();
    const monthIdx = base.getMonth();
    const monthStart = new Date(year, monthIdx, 1);
    const monthEnd = new Date(year, monthIdx + 1, 0);
    const startOfGrid = new Date(monthStart);
    startOfGrid.setDate(monthStart.getDate() - monthStart.getDay()); // Sunday
    const endOfGrid = new Date(monthEnd);
    endOfGrid.setDate(monthEnd.getDate() + (6 - monthEnd.getDay())); // Saturday

    const grid: Date[] = [];
    const cur = new Date(startOfGrid);
    while (cur <= endOfGrid) {
      grid.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }

    const monthName = monthStart.toLocaleString(undefined, { month: "long", year: "numeric" });
    return { title: monthName, days: grid.map(strip) };
  }, [base]);

  // Map tasks to active days in this month
  const byDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((t) => {
      const s = parseISOish(t.startDate);
      const e = parseISOish(t.endDate);
      if (!s || !e) return;
      // walk from s..e, but only put items that land in our grid
      const cur = new Date(s);
      while (cur <= e) {
        const key = ymd(cur);
        map.set(key, [...(map.get(key) || []), t]);
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [tasks]);

  function exportCSV() {
    const rows = [
      ["id", "name", "status", "startDate", "endDate"],
      ...tasks.map((t) => [
        t.id,
        t.name,
        // normalize “Completed” to “Done” so exports are consistent
        t.status === "Completed" ? "Done" : (t.status ?? "Not Started"),
        t.startDate ?? "",
        t.endDate ?? "",
      ]),
    ];
    const csv = rows.map((r) =>
      r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calendar-export-${title.replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printPDF() {
    // Simple, robust approach: print the section; use your global @media print to format
    window.print();
  }

  return (
    <section ref={containerRef} className="rounded border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-medium">{title}</h2>
        <div className="flex items-center gap-2">
          <button className="rounded bg-black px-3 py-1 text-white" onClick={exportCSV}>
            Export CSV
          </button>
          <button className="rounded border px-3 py-1" onClick={printPDF}>
            Print PDF
          </button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 text-xs text-gray-600">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
          <div key={d} className="px-2 py-1">{d}</div>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {days.map((d) => {
          const dateKey = ymd(d);
          const dayTasks = byDay.get(dateKey) || [];
          const inMonth = d.getMonth() === base.getMonth();
          return (
            <div key={dateKey} className="min-h-[110px] bg-white p-2 align-top">
              <div className={`mb-1 text-xs ${inMonth ? "text-gray-900" : "text-gray-400"}`}>
                {d.getDate()}
              </div>
              <div className="space-y-1">
                {dayTasks.slice(0, 4).map((t) => (
                  <div
                    key={`${dateKey}-${t.id}`}
                    className="truncate rounded px-1 py-[2px] text-[11px]"
                    style={{
                      background: "#eef2ff", // subtle
                      border: "1px solid #e5e7eb",
                    }}
                    title={`${t.name} (${t.startDate ?? "?"} → ${t.endDate ?? "?"})`}
                  >
                    {t.name}
                  </div>
                ))}
                {dayTasks.length > 4 && (
                  <div className="text-[11px] text-gray-500">+{dayTasks.length - 4} more…</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}