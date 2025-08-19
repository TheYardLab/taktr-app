// components/TaktPlanSection.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";

/** Firestore task shape (kept loose) */
type TaskDoc = {
  id: string;
  name: string;
  trade?: string | null;
  subcontractor?: string | null;
  status?: string | null;
  startDate?: string | null; // "YYYY-MM-DD"
  endDate?: string | null;   // "YYYY-MM-DD"
  zone?: string | null;      // accepts "area" too
};

type Props = { projectId: string };

type TaktMeta = {
  zones: string[];
  trades: string[];
  taktDays: number;
};

function toYMD(v: any) {
  if (!v) return "";
  if (typeof v === "string") return (v.split("T")[0] || v) as string;
  if (typeof (v as any)?.seconds === "number") {
    const d = new Date((v as any).seconds * 1000);
    return d.toISOString().slice(0, 10);
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

const parseYMD = (s?: string | null) => {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const MS_PER_DAY = 86400000;
const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const daysBetween = (a: Date, b: Date) =>
  Math.max(1, Math.floor((stripTime(b).getTime() - stripTime(a).getTime()) / MS_PER_DAY) + 1);
const dateAdd = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

function fmtDM(d: Date) {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function hashToHue(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

/** Packs bars into lanes (rows) to avoid overlaps. Returns lane index for each task. */
function packLanes(tasks: Array<{ id: string; s: Date; e: Date; key: string }>) {
  // sort by start then duration
  const sorted = [...tasks].sort((a, b) => a.s.getTime() - b.s.getTime() || a.e.getTime() - b.e.getTime());
  const laneEnds: Date[] = []; // end time for each lane
  const laneByTask = new Map<string, number>();
  for (const t of sorted) {
    let lane = 0;
    // try to place into earliest free lane
    while (lane < laneEnds.length && laneEnds[lane].getTime() >= t.s.getTime()) lane++;
    if (lane === laneEnds.length) laneEnds.push(t.e);
    else laneEnds[lane] = t.e;
    laneByTask.set(t.id, lane);
  }
  return { laneByTask, laneCount: laneEnds.length };
}

export default function TaktPlanSection({ projectId }: Props) {
  const [tasks, setTasks] = useState<TaskDoc[]>([]);
  const [meta, setMeta] = useState<TaktMeta>({ zones: [], trades: [], taktDays: 5 });
  // subscribe to takt meta (subcollection doc 'taktMeta/meta'); fall back to defaults if missing
  useEffect(() => {
    if (!projectId) return;
    const mref = doc(db, "projects", projectId, "taktMeta", "meta");
    const unsub = onSnapshot(mref, (snap) => {
      const d = snap.data() as Partial<TaktMeta> | undefined;
      setMeta({
        zones: Array.isArray(d?.zones) ? (d!.zones as string[]) : [],
        trades: Array.isArray(d?.trades) ? (d!.trades as string[]) : [],
        taktDays: typeof d?.taktDays === "number" ? (d!.taktDays as number) : 5,
      });
    }, () => {
      setMeta({ zones: [], trades: [], taktDays: 5 });
    });
    return () => unsub();
  }, [projectId]);

  const saveMeta = async (next: Partial<TaktMeta>) => {
    if (!projectId) return;
    const mref = doc(db, "projects", projectId, "taktMeta", "meta");
    await setDoc(mref, next, { merge: true });
  };
  const addZone = async () => {
    const name = (prompt("Add Zone name") || "").trim();
    if (!name) return;
    const zones = Array.from(new Set([...(meta.zones || []), name]));
    setMeta((m) => ({ ...m, zones }));
    await saveMeta({ zones });
  };
  const removeZone = async (z: string) => {
    const zones = (meta.zones || []).filter((x) => x !== z);
    setMeta((m) => ({ ...m, zones }));
    await saveMeta({ zones });
  };
  const addTrade = async () => {
    const name = (prompt("Add Trade name") || "").trim();
    if (!name) return;
    const trades = Array.from(new Set([...(meta.trades || []), name]));
    setMeta((m) => ({ ...m, trades }));
    await saveMeta({ trades });
  };
  const removeTrade = async (t: string) => {
    const trades = (meta.trades || []).filter((x) => x !== t);
    setMeta((m) => ({ ...m, trades }));
    await saveMeta({ trades });
  };
  const setTaktDays = async (v: number) => {
    const taktDays = Math.max(1, Math.min(30, Math.floor(v)));
    setMeta((m) => ({ ...m, taktDays }));
    await saveMeta({ taktDays });
  };

  const [dayWidth, setDayWidth] = useState(30); // zoomable
  const containerRef = useRef<HTMLDivElement>(null);

  // Live tasks from Firestore
  useEffect(() => {
    if (!projectId) return;
    const colRef = collection(db, "projects", projectId, "tasks");
    const unsub = onSnapshot(colRef, (snap) => {
      const list: TaskDoc[] = [];
      snap.forEach((d) => {
        const x = d.data() as any;
        list.push({
          id: d.id,
          name: String(x.name || x.task || ""),
          trade: x.trade ?? null,
          subcontractor: x.subcontractor ?? null,
          status: x.status ?? null,
          startDate: toYMD(x.startDate ?? x.start ?? x.plannedStart),
          endDate: toYMD(x.endDate ?? x.finish ?? x.plannedFinish),
          zone: (x.zone ?? x.area ?? null) || null,
        });
      });
      setTasks(list);
    });
    return () => unsub();
  }, [projectId]);

  // Bounds
  const { start, end } = useMemo(() => {
    const starts: Date[] = [];
    const ends: Date[] = [];
    for (const t of tasks) {
      const s = parseYMD(t.startDate);
      const e = parseYMD(t.endDate);
      if (s) starts.push(stripTime(s));
      if (e) ends.push(stripTime(e));
    }
    const start = starts.length ? new Date(Math.min(...starts.map((d) => d.getTime()))) : stripTime(new Date());
    const end = ends.length ? new Date(Math.max(...ends.map((d) => d.getTime()))) : stripTime(new Date());
    // ensure at least 21 days visible
    if (daysBetween(start, end) < 21) end.setDate(end.getDate() + (21 - daysBetween(start, end)));
    return { start, end };
  }, [tasks]);

  const days = useMemo(() => Array.from({ length: daysBetween(start, end) }, (_, i) => dateAdd(start, i)), [start, end]);

  // Group by zone, then by trade per zone (wagons); pack into lanes to emulate trains visually
  type ZoneRow = {
    name: string;
    tasks: TaskDoc[];
    laneById: Map<string, number>;
    laneCount: number;
    height: number;
  };

  const zoneRows: ZoneRow[] = useMemo(() => {
    const map = new Map<string, TaskDoc[]>();
    // seed with meta.zones so empty zones still render
    for (const z of meta.zones || []) {
      if (z && !map.has(z)) map.set(z, []);
    }
    for (const t of tasks) {
      const z = (t.zone || "Unzoned").trim();
      if (!map.has(z)) map.set(z, []);
      map.get(z)!.push(t);
    }
    const rows: ZoneRow[] = [];
    for (const [name, list] of map) {
      // prepare for lane packing (pack by overlap, regardless of trade, which naturally stacks trades)
      const packInput = list
        .map((t) => {
          const s = parseYMD(t.startDate);
          const e = parseYMD(t.endDate);
          if (!s || !e) return null;
          return { id: t.id, s, e, key: (t.trade || "Unassigned").trim() };
        })
        .filter(Boolean) as Array<{ id: string; s: Date; e: Date; key: string }>;
      const { laneByTask, laneCount } = packLanes(packInput);
      const laneById = new Map<string, number>(laneByTask);
      const height = Math.max(1, laneCount) * 38; // 38px per lane (rowHeight)
      rows.push({ name, tasks: list, laneById, laneCount: Math.max(1, laneCount), height });
    }
    // stable order
    rows.sort((a, b) => a.name.localeCompare(b.name));
    return rows;
  }, [tasks, meta.zones]);

  // Vertical layout for variable-height zones
  const headerHeight = 44;
  const leftColWidth = 180;
  const totalHeight = headerHeight + zoneRows.reduce((acc, r) => acc + r.height, 0);
  const totalWidth = Math.max(1000, days.length * dayWidth + leftColWidth);

  const yOffsets: number[] = useMemo(() => {
    const offsets: number[] = [];
    let y = headerHeight;
    for (const r of zoneRows) {
      offsets.push(y);
      y += r.height;
    }
    return offsets;
  }, [zoneRows, headerHeight]);

  const todayX = (() => {
    const i = Math.floor((stripTime(new Date()).getTime() - start.getTime()) / MS_PER_DAY);
    return leftColWidth + i * dayWidth;
  })();

  const zoom = (delta: number) => {
    setDayWidth((w) => Math.max(16, Math.min(80, w + delta)));
    // keep the current scroll anchor in view
    requestAnimationFrame(() => {
      containerRef.current?.scrollBy({ left: delta * 10, behavior: "instant" as any });
    });
  };

  return (
    <div
      className="relative rounded border bg-white"
      style={{
        resize: "both",
        overflow: "auto",
        minWidth: 1100,
        minHeight: 600,
        padding: 12,
      }}
      ref={containerRef}
    >
      <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
        <div>
          <strong>Takt Plan</strong>{" "}
          <span className="ml-2">
            Zones: {Math.max(zoneRows.length, (meta.zones || []).length)} • Trades: {new Set(tasks.map((t) => (t.trade || "Unassigned").trim())).size} •{" "}
            Takt: {meta.taktDays} days
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded border px-2 py-0.5 text-xs" onClick={() => zoom(-6)} title="Zoom out">−</button>
          <span className="text-xs text-gray-500">Day width: {dayWidth}px</span>
          <button className="rounded border px-2 py-0.5 text-xs" onClick={() => zoom(6)} title="Zoom in">+</button>
        </div>
      </div>

      {/* Meta editor */}
      <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="rounded border p-2 bg-gray-50">
          <div className="mb-2 font-medium text-gray-700">Zones</div>
          <div className="flex flex-wrap gap-2">
            {(meta.zones || []).map((z) => (
              <span key={z} className="inline-flex items-center gap-1 rounded border bg-white px-2 py-0.5">
                {z}
                <button className="text-xs text-red-600" title="Remove" onClick={() => removeZone(z)}>×</button>
              </span>
            ))}
          </div>
          <button className="mt-2 rounded border px-2 py-1" onClick={addZone}>+ Add Zone</button>
        </div>
        <div className="rounded border p-2 bg-gray-50">
          <div className="mb-2 font-medium text-gray-700">Trades</div>
          <div className="flex flex-wrap gap-2">
            {(meta.trades || []).map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded border bg-white px-2 py-0.5">
                {t}
                <button className="text-xs text-red-600" title="Remove" onClick={() => removeTrade(t)}>×</button>
              </span>
            ))}
          </div>
          <button className="mt-2 rounded border px-2 py-1" onClick={addTrade}>+ Add Trade</button>
          <div className="mt-3 flex items-center gap-2">
            <label className="text-gray-700">Takt (days):</label>
            <input
              type="number"
              min={1}
              max={30}
              value={meta.taktDays}
              onChange={(e) => setTaktDays(parseInt(e.target.value || "5", 10))}
              className="w-20 rounded border px-2 py-1"
            />
          </div>
        </div>
      </div>

      <div
        className="relative overflow-auto border rounded"
        style={{ background: "#fff", width: totalWidth, height: totalHeight }}
        data-export-width={totalWidth}
        data-export-height={totalHeight}
      >
        {/* Left header */}
        <div
          className="sticky left-0 top-0 z-20 border-b border-r bg-white"
          style={{ width: leftColWidth, height: headerHeight, display: "flex", alignItems: "center", paddingLeft: 10 }}
        >
          <span className="text-xs font-semibold text-gray-700">Zone</span>
        </div>

        {/* Top day scale (with heavier week lines) */}
        <div
          className="sticky top-0 z-10 border-b bg-white"
          style={{ marginLeft: leftColWidth, height: headerHeight, width: totalWidth - leftColWidth }}
        >
          <div style={{ position: "relative", height: "100%" }}>
            {days.map((d, i) => {
              const isMon = d.getDay() === 1; // Monday
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: i * dayWidth,
                    top: 0,
                    width: dayWidth,
                    height: headerHeight,
                    borderLeft: `1px solid ${isMon ? "#cbd5e1" : "#e5e7eb"}`,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      bottom: 6,
                      left: 4,
                      fontSize: 10,
                      color: "#6b7280",
                      fontWeight: isMon ? 600 : 400,
                    }}
                  >
                    {fmtDM(d)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Left zones column */}
        <div style={{ width: leftColWidth }}>
          <div style={{ height: headerHeight }} />
          {zoneRows.map((z, idx) => (
            <div
              key={z.name}
              className="border-r"
              style={{
                height: z.height,
                display: "flex",
                alignItems: "center",
                paddingLeft: 10,
                borderBottom: "1px solid #f1f5f9",
                position: "relative",
                background: idx % 2 ? "#fafafa" : "#fff",
              }}
            >
              <span className="text-xs font-medium text-gray-700 truncate">{z.name}</span>
            </div>
          ))}
        </div>

        {/* Right chart layer */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: leftColWidth,
            width: totalWidth - leftColWidth,
            height: totalHeight,
          }}
        >
          {/* Vertical grid */}
          <div style={{ position: "absolute", top: headerHeight, left: 0, right: 0, bottom: 0 }}>
            {days.map((d, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: i * dayWidth,
                  top: 0,
                  bottom: 0,
                  width: 0,
                  borderLeft: `1px solid ${d.getDay() === 1 ? "#cbd5e1" : "#f1f5f9"}`,
                }}
              />
            ))}
            {/* Today line */}
            <div
              style={{
                position: "absolute",
                left: todayX - leftColWidth,
                top: 0,
                bottom: 0,
                width: 0,
                borderLeft: "2px dashed #ef4444",
              }}
              title="Today"
            />
          </div>

          {/* Zone sections */}
          <div style={{ position: "absolute", top: headerHeight, left: 0, right: 0 }}>
            {zoneRows.map((z, zi) => {
              const yTop = yOffsets[zi];
              const rowHeight = z.height / z.laneCount;

              return (
                <div key={z.name} style={{ position: "absolute", left: 0, right: 0, top: yTop - headerHeight, height: z.height }}>
                  {/* bars */}
                  {z.tasks.map((t) => {
                    const s = parseYMD(t.startDate);
                    const e = parseYMD(t.endDate);
                    if (!s || !e) return null;
                    const startIdx = Math.max(0, Math.floor((s.getTime() - start.getTime()) / MS_PER_DAY));
                    const barDays = daysBetween(s, e);
                    const left = startIdx * dayWidth + 2;
                    const width = Math.max(14, barDays * dayWidth - 4);
                    const lane = z.laneById.get(t.id) ?? 0;
                    const top = lane * rowHeight + 6;

                    const label =
                      (t.trade ? `${t.trade} • ` : "") +
                      (t.name || "") +
                      (t.subcontractor ? ` • ${t.subcontractor}` : "");
                    const hue = hashToHue(t.trade || "Unassigned");
                    const bg = `hsl(${hue} 85% 88%)`;
                    const bd = `hsl(${hue} 70% 45%)`;

                    return (
                      <div
                        key={t.id}
                        title={label}
                        style={{
                          position: "absolute",
                          left,
                          top,
                          height: rowHeight - 12,
                          width,
                          background: bg,
                          border: `1px solid ${bd}`,
                          borderRadius: 6,
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            lineHeight: 1.1,
                            color: "#111827",
                            padding: "0 6px",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            width: "100%",
                            fontWeight: 500,
                          }}
                        >
                          {label}
                        </div>
                      </div>
                    );
                  })}

                  {/* row divider */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: -1,
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Help */}
      <div className="mt-2 text-xs text-gray-500">
        Tip: Use +/− to zoom the day width. Drag the lower-right handle to resize. Bars show
        <em> Trade • Task • Subcontractor</em>. Zones are listed on the left; overlapping work stacks into lanes to resemble trains/wagons.
      </div>
      <script
        // @ts-ignore
        dangerouslySetInnerHTML={{
          __html: `
          ;(function(){
            window.__TAKTR_GET_EXPORT_SIZE = function(){
              var el = document.querySelector('[data-export-width][data-export-height]');
              if(!el) return null;
              return { w: Number(el.getAttribute('data-export-width')), h: Number(el.getAttribute('data-export-height')) };
            };
          })();`,
        }}
      />
    </div>
  );
}