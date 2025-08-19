// components/views/GanttView.tsx
import React, { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

type Props = { projectId: string };

type Task = {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  trade?: string;
};

const toDate = (s?: string) => {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};
const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

export default function GanttView({ projectId }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!projectId) return;
    const ref = collection(db, "projects", projectId, "tasks");
    const unsub = onSnapshot(ref, (snap) => {
      const rows: Task[] = [];
      snap.forEach((d) => {
        const x = d.data() as any;
        rows.push({
          id: d.id,
          name: x.name || x.task || "",
          startDate: (x.startDate || x.start || "").split("T")[0] || "",
          endDate: (x.endDate || x.finish || "").split("T")[0] || "",
          status: x.status || "",
          trade: x.trade || "",
        });
      });
      setTasks(rows);
    });
    return () => unsub();
  }, [projectId]);

  const [start, end] = useMemo(() => {
    let min: Date | null = null;
    let max: Date | null = null;
    for (const t of tasks) {
      const s = toDate(t.startDate);
      const e = toDate(t.endDate);
      if (s && (!min || s < min)) min = s;
      if (e && (!max || e > max)) max = e;
    }
    if (!min || !max) {
      const today = new Date();
      const in2w = new Date();
      in2w.setDate(in2w.getDate() + 14);
      return [today, in2w];
    }
    return [min, max];
  }, [tasks]);

  // build day headers
  const days: Date[] = useMemo(() => {
    const out: Date[] = [];
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    const last = new Date(end);
    last.setHours(0, 0, 0, 0);
    while (cursor <= last) {
      out.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return out;
  }, [start, end]);

  // map Y positions (rows)
  const rows = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""));
    return sorted;
  }, [tasks]);

  // x scale
  const dayWidth = 18; // px per day
  const leftForDate = (d?: string) => {
    const dt = toDate(d);
    if (!dt) return 0;
    const diff = Math.round((dt.getTime() - new Date(ymd(start)).getTime()) / (24 * 3600 * 1000));
    return Math.max(0, diff) * dayWidth;
    // NOTE: left edge clamp; right can overflow container (scrollable)
  };
  const widthFor = (s?: string, e?: string) => {
    const ds = toDate(s);
    const de = toDate(e);
    if (!ds || !de) return dayWidth;
    const diff = Math.max(1, Math.round((de.getTime() - ds.getTime()) / (24 * 3600 * 1000)) + 1);
    return diff * dayWidth;
  };

  return (
    <div className="rounded border bg-white">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="font-semibold">Gantt</div>
        <div className="text-xs text-gray-500">
          {ymd(start)} → {ymd(end)} • {rows.length} tasks
        </div>
      </div>

      <div className="grid grid-cols-[260px_1fr]">
        {/* left task list */}
        <div className="border-r">
          <div className="sticky top-0 z-10 bg-white border-b px-3 py-2 text-xs font-semibold">
            Task
          </div>
          <div>
            {rows.map((t) => (
              <div key={t.id} className="border-b px-3 py-2 text-sm">
                <div className="truncate">{t.name || <span className="text-gray-400">—</span>}</div>
                <div className="text-[11px] text-gray-500">
                  {t.trade ? `${t.trade} • ` : ""}
                  {t.status || ""}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* right chart */}
        <div className="overflow-x-auto">
          {/* header days */}
          <div className="sticky top-0 z-10 flex border-b bg-white">
            {days.map((d, i) => (
              <div
                key={i}
                className="border-r px-2 py-2 text-center text-[10px]"
                style={{ width: dayWidth }}
                title={ymd(d)}
              >
                {d.getMonth() + 1}/{d.getDate()}
              </div>
            ))}
          </div>

          {/* bars */}
          <div>
            {rows.map((t) => (
              <div key={t.id} className="relative border-b" style={{ height: 28 }}>
                <div
                  className="absolute top-1 h-5 rounded bg-blue-500/80"
                  style={{
                    left: leftForDate(t.startDate),
                    width: widthFor(t.startDate, t.endDate),
                    minWidth: 10,
                  }}
                  title={`${t.name}\n${t.startDate || "?"} → ${t.endDate || "?"}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}