// components/SCurve.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

type TSLike = { seconds: number; nanoseconds?: number };
type Task = {
  id: string;
  name?: string;
  // support both legacy and current field names
  start?: TSLike | Date | string;
  end?: TSLike | Date | string;           // legacy planned finish
  startDate?: TSLike | Date | string;     // current planned start
  endDate?: TSLike | Date | string;       // current planned finish
  actualEnd?: TSLike | Date | string;     // optional actual finish
  status?: string;
};

function toDate(v?: TSLike | Date | string): Date | undefined {
  if (!v) return undefined;
  if (typeof v === 'string') {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  if (v instanceof Date) return v;
  if (typeof (v as TSLike).seconds === 'number') {
    return new Date((v as TSLike).seconds * 1000);
  }
  return undefined;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function dateKey(d: Date): string {
  return startOfDay(d).toISOString().slice(0, 10);
}

type Props = {
  /** Optional: if provided we render from these tasks and skip Firestore */
  tasks?: Task[];
  /** Optional: if provided (and no tasks prop), we stream tasks from Firestore */
  projectId?: string;
};

export default function SCurve({ tasks: tasksProp, projectId }: Props) {
  const [tasksFS, setTasksFS] = useState<Task[]>([]);

  // If tasks are not passed in, and we have a projectId, load from Firestore
  useEffect(() => {
    if (tasksProp || !projectId) return;
    // Try ordering by endDate first; if missing index the listener still works without orderBy
    const col = collection(db, 'projects', projectId, 'tasks');
    const q = query(col, orderBy('endDate', 'asc'));
    const unsub = onSnapshot(
      q,
      snap => {
        const rows: Task[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setTasksFS(rows);
      },
      // If index for orderBy isn't available, gracefully fall back to unordered stream
      () => {
        const unsub2 = onSnapshot(col, snap2 => {
          const rows: Task[] = snap2.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
          setTasksFS(rows);
        });
        // return fallback unsub on error path
        return unsub2;
      }
    );
    return () => unsub();
  }, [tasksProp, projectId]);

  const tasks = tasksProp ?? tasksFS;

  const { days, planned, actual, maxY } = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return { days: [] as Date[], planned: [] as number[], actual: [] as number[], maxY: 0 };
    }

    // Collect planned & actual dates, supporting both legacy (end) and current (endDate) fields
    const plannedDates: Date[] = [];
    const actualDates: Date[] = [];

    for (const t of tasks) {
      const plannedFinish = toDate(t.endDate ?? t.end);
      if (plannedFinish) plannedDates.push(startOfDay(plannedFinish));

      // actual — use explicit actualEnd if present, otherwise if status is done/completed use planned finish
      const s = (t.status || '').toLowerCase();
      const isDone = s === 'done' || s === 'completed';
      const actualFinish = toDate(t.actualEnd) ?? (isDone ? plannedFinish : undefined);
      if (actualFinish) actualDates.push(startOfDay(actualFinish));
    }

    if (plannedDates.length === 0 && actualDates.length === 0) {
      return { days: [] as Date[], planned: [] as number[], actual: [] as number[], maxY: 0 };
    }

    plannedDates.sort((a, b) => a.getTime() - b.getTime());
    actualDates.sort((a, b) => a.getTime() - b.getTime());

    const minDate = new Date(
      Math.min(
        plannedDates.length ? plannedDates[0].getTime() : Infinity,
        actualDates.length ? actualDates[0].getTime() : Infinity
      )
    );
    const maxDate = new Date(
      Math.max(
        plannedDates.length ? plannedDates[plannedDates.length - 1].getTime() : -Infinity,
        actualDates.length ? actualDates[actualDates.length - 1].getTime() : -Infinity
      )
    );

    if (!(minDate.getTime() <= maxDate.getTime())) {
      return { days: [] as Date[], planned: [] as number[], actual: [] as number[], maxY: 0 };
    }

    // Build continuous day range
    const range: Date[] = [];
    let cursor = startOfDay(minDate);
    while (cursor <= maxDate) {
      range.push(new Date(cursor));
      cursor = addDays(cursor, 1);
    }

    // Daily counts → cumulative
    const plannedCountByDay = new Map<string, number>();
    for (const d of plannedDates) {
      const k = dateKey(d);
      plannedCountByDay.set(k, (plannedCountByDay.get(k) || 0) + 1);
    }
    const actualCountByDay = new Map<string, number>();
    for (const d of actualDates) {
      const k = dateKey(d);
      actualCountByDay.set(k, (actualCountByDay.get(k) || 0) + 1);
    }

    const plannedCum: number[] = [];
    const actualCum: number[] = [];
    let pSum = 0;
    let aSum = 0;
    for (const d of range) {
      const k = dateKey(d);
      pSum += plannedCountByDay.get(k) || 0;
      aSum += actualCountByDay.get(k) || 0;
      plannedCum.push(pSum);
      actualCum.push(aSum);
    }

    const maxYVal = Math.max(plannedCum.at(-1) || 0, actualCum.at(-1) || 0);
    return { days: range, planned: plannedCum, actual: actualCum, maxY: maxYVal };
  }, [tasks]);

  // Empty states
  if (!tasksProp && !projectId) {
    return <div className="text-sm text-gray-500">Provide tasks or a projectId to render the S-Curve.</div>;
  }
  if (!tasks || tasks.length === 0) {
    return (
      <div className="rounded border border-dashed p-4 text-sm text-gray-500">
        No tasks with finish dates found. Import a schedule or add tasks to see the S-Curve.
      </div>
    );
  }

  // --- Simple responsive SVG chart ---
  const width = 900;
  const height = 320;
  const margin = { top: 16, right: 16, bottom: 36, left: 44 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const x = (i: number) => (i / Math.max(1, days.length - 1)) * innerW;
  const y = (v: number) => innerH - (v / Math.max(1, maxY)) * innerH;

 

// WITH this
const plannedPath =
  planned.length === 0
    ? ''
    : planned
        .map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(2)} ${y(v).toFixed(2)}`)
        .join(' ');


// WITH this
const actualPath =
  actual.length === 0
    ? ''
    : actual
        .map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(2)} ${y(v).toFixed(2)}`)
        .join(' ');

  const yTicks = 5;
  const xTicks = Math.min(8, Math.max(1, days.length - 1));

  return (
    <div className="overflow-auto rounded border bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700">
          S-Curve (Cumulative Planned vs Actual)
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-4 rounded-sm bg-blue-600" /> Planned
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-4 rounded-sm bg-green-600" /> Actual
          </span>
        </div>
      </div>

      <svg width={width} height={height} role="img" aria-label="S-Curve chart">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Y grid & ticks */}
          {Array.from({ length: yTicks + 1 }, (_, i) => {
            const v = (i / yTicks) * maxY;
            const yy = y(v);
            return (
              <g key={`y-${i}`}>
                <line x1={0} x2={innerW} y1={yy} y2={yy} stroke="#e5e7eb" />
                <text x={-8} y={yy} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="#6b7280">
                  {Math.round(v)}
                </text>
              </g>
            );
          })}

          {/* X ticks */}
          {Array.from({ length: xTicks + 1 }, (_, i) => {
            const idx = Math.round((i / xTicks) * (days.length - 1));
            const dd = days[idx];
            const xx = x(idx);
            return (
              <g key={`x-${i}`}>
                <line x1={xx} x2={xx} y1={0} y2={innerH} stroke="#f3f4f6" />
                <text x={xx} y={innerH + 16} textAnchor="middle" fontSize="10" fill="#6b7280">
                  {dd.toLocaleDateString()}
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke="#9ca3af" />
          <line x1={0} x2={0} y1={0} y2={innerH} stroke="#9ca3af" />

          {/* Lines */}
          <path d={plannedPath} fill="none" stroke="#2563eb" strokeWidth={2} />
          <path d={actualPath} fill="none" stroke="#16a34a" strokeWidth={2} />
        </g>
      </svg>
    </div>
  );
}