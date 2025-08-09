// components/SCurve.tsx
import React, { useMemo } from "react";

type Task = {
  id: string;
  endDate?: string;
  status?: "Not Started" | "In Progress" | "Blocked" | "Done" | "Completed";
};

const ONE_DAY = 1000 * 60 * 60 * 24;

export default function SCurve({ tasks }: { tasks: Task[] }) {
  const points = useMemo(() => {
    const doneDates = (tasks || [])
      .filter((t) => (t.status === "Done" || t.status === "Completed") && t.endDate)
      .map((t) => new Date(t.endDate!))
      .filter((d) => !Number.isNaN(d.getTime()))
      .map((d) => {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        return x.getTime();
      })
      .sort((a, b) => a - b);

    if (!doneDates.length) return [] as Array<{ d: string; c: number }>;

    const min = doneDates[0];
    const max = doneDates[doneDates.length - 1];
    const span = Math.max(1, Math.round((max - min) / ONE_DAY) + 1);

    const curve: Array<{ d: string; c: number }> = [];
    let cumulative = 0;
    for (let i = 0; i < span; i++) {
      const day = min + i * ONE_DAY;
      while (doneDates[0] !== undefined && doneDates[0] <= day) {
        doneDates.shift();
        cumulative++;
      }
      curve.push({ d: new Date(day).toISOString().slice(0, 10), c: cumulative });
    }
    return curve;
  }, [tasks]);

  if (!points.length) return <div className="text-sm text-gray-500">No completed tasks yet.</div>;

  // very simple line using CSS (no libs)
  // x = index, y = cumulative
  const maxC = points[points.length - 1].c;
  const height = 160;
  const width = Math.max(320, points.length * 8);

  const path = (() => {
    const toY = (c: number) => height - (c / maxC) * (height - 20) - 10;
    const toX = (i: number) => 10 + i * (width / Math.max(1, points.length - 1));
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.c)}`)
      .join(" ");
  })();

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="border rounded bg-white">
        {/* axes */}
        <line x1="10" y1={height - 10} x2={width - 10} y2={height - 10} stroke="#e5e7eb" />
        <line x1="10" y1="10" x2="10" y2={height - 10} stroke="#e5e7eb" />
        {/* path */}
        <path d={path} fill="none" stroke="#0ea5e9" strokeWidth="2" />
        {/* last label */}
        <text x={width - 50} y={20} fontSize="10" fill="#374151">
          Total: {maxC}
        </text>
      </svg>
    </div>
  );
}