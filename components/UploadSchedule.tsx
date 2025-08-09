// components/UploadSchedule.tsx
import React, { useMemo, useState } from "react";
import Papa from "papaparse";
import type { User } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { useProjectContext } from "@/lib/ProjectContext";

/**
 * Keep this Row type independent from your Firestore Task type
 * to avoid strict TS mismatch while importing CSV.
 */
type Row = {
  _row?: number;
  _warn?: string;
  id?: string;
  name?: string;
  status?: "Not Started" | "In Progress" | "Blocked" | "Done";
  startDate?: string; // ISO string
  endDate?: string;   // ISO string
};

const STATUS = ["Not Started", "In Progress", "Blocked", "Done"] as const;

function normalizeStatus(v: string | undefined): Row["status"] {
  const s = (v || "").toLowerCase();
  if (/done|complete|completed|finished/.test(s)) return "Done";
  if (/block/.test(s)) return "Blocked";
  if (/progress|working|active|wip/.test(s)) return "In Progress";
  return "Not Started";
}

function normalizeName(v?: string) {
  if (!v) return "";
  const parts = v.split(":");
  // If input is "Project: Task Name" → keep only the task part
  return parts.length > 1 ? parts.slice(1).join(":").trim() : v.trim();
}

function toDateInputValue(val?: string | Date | null) {
  const d =
    typeof val === "string" ? new Date(val) :
    val instanceof Date ? val :
    null;
  if (!d || Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function parseDateLike(v?: string): string | undefined {
  if (!v) return undefined;
  // Try native parse first
  const guess = new Date(v);
  if (!Number.isNaN(guess.getTime())) return guess.toISOString();

  // Try MM/DD/YYYY or MM-DD-YYYY
  const mdy = v.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (mdy) {
    const [, m, d, y] = mdy;
    const year = +y < 100 ? 2000 + +y : +y;
    const dt = new Date(year, +m - 1, +d);
    return Number.isNaN(dt.getTime()) ? undefined : dt.toISOString();
  }
  return undefined;
}

export default function UploadSchedule() {
  const { projectId, refreshTasks } = useProjectContext();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const readyCount = useMemo(
    () =>
      rows.filter(
        (r) => r.name && r.startDate && r.endDate && STATUS.includes((r.status as any) ?? "Not Started")
      ).length,
    [rows]
  );

  function handleFile(file: File) {
    setError(null);
    setOk(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const mapped: Row[] = (res.data as any[]).map((raw, i) => {
          // Flexible header mapping
          const name = normalizeName(
            raw.name ??
              raw.task ??
              raw.taskName ??
              raw["Task Name"] ??
              raw.title ??
              raw["Title"]
          );

          const status = normalizeStatus(raw.status ?? raw.state ?? raw.phase);

          const start = parseDateLike(
            raw.start ??
              raw.startDate ??
              raw["Start Date"] ??
              raw.start_time ??
              raw["Start"] ??
              raw["Planned Start"]
          );

          const end = parseDateLike(
            raw.end ??
              raw.endDate ??
              raw["End Date"] ??
              raw.finish ??
              raw["Finish"] ??
              raw["Planned Finish"]
          );

          const warn =
            !name ? "Missing task name" :
            !start ? "Missing/invalid start date" :
            !end ? "Missing/invalid end date" :
            undefined;

          return {
            _row: i + 1,
            _warn: warn,
            id: raw.id || undefined,
            name,
            status,
            startDate: start,
            endDate: end,
          };
        });
        setRows(mapped);
      },
      error: (err) => setError(err.message),
    });
  }

  async function upload() {
    setError(null);
    setOk(null);

    const auth = getAuth();
    const user = auth.currentUser as User | null;
    if (!user) {
      setError("You must be signed in to upload. (UID required by Firestore rules)");
      return;
    }
    if (!projectId) {
      setError("Project ID is missing. Please create or select a project before uploading.");
      return;
    }

    const good = rows.filter((r) => r.name && r.startDate && r.endDate);
    if (!good.length) {
      setError("Nothing to upload. Fix highlighted rows first.");
      return;
    }

    setBusy(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/uploadSchedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          projectId,
          tasks: good.map((r) => ({
            id: r.id,
            name: r.name!,
            status: (r.status as Row["status"]) ?? "Not Started",
            startDate: r.startDate!,
            endDate: r.endDate!,
          })),
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Upload failed with ${res.status}`);
      }

      const { ok: okFlag, count } = await res.json();
      if (!okFlag) throw new Error("Upload failed");
      setOk(`Uploaded ${count} task(s).`);
      setRows([]);
      refreshTasks?.();
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-md border p-4">
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <button
          className="rounded bg-black px-3 py-1 text-white disabled:opacity-50"
          onClick={upload}
          disabled={busy || !rows.length}
        >
          {busy ? "Uploading…" : `Upload to Project${projectId ? ` (${projectId})` : ""}`}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {ok && <p className="mt-3 text-sm text-green-700">{ok}</p>}

      {!!rows.length && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">#</th>
                <th className="py-2 pr-3">Task Name</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Start</th>
                <th className="py-2 pr-3">End</th>
                <th className="py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => {
                const bad = !r.name || !r.startDate || !r.endDate;
                return (
                  <tr key={idx} className={bad ? "bg-yellow-50" : ""}>
                    <td className="py-2 pr-3">{r._row}</td>
                    <td className="py-2 pr-3">
                      <input
                        className="w-64 rounded border px-2 py-1"
                        value={r.name || ""}
                        onChange={(e) =>
                          setRows((cur) => cur.map((c, i) => (i === idx ? { ...c, name: e.target.value } : c)))
                        }
                        placeholder="Task name"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <select
                        className="w-40 rounded border px-2 py-1"
                        value={(r.status as Row["status"]) || "Not Started"}
                        onChange={(e) =>
                          setRows((cur) =>
                            cur.map((c, i) =>
                              i === idx ? { ...c, status: e.target.value as Row["status"] } : c
                            )
                          )
                        }
                      >
                        {STATUS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="date"
                        className="rounded border px-2 py-1"
                        value={toDateInputValue(r.startDate as any)}
                        onChange={(e) =>
                          setRows((cur) =>
                            cur.map((c, i) =>
                              i === idx ? { ...c, startDate: new Date(e.target.value).toISOString() } : c
                            )
                          )
                        }
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="date"
                        className="rounded border px-2 py-1"
                        value={toDateInputValue(r.endDate as any)}
                        onChange={(e) =>
                          setRows((cur) =>
                            cur.map((c, i) =>
                              i === idx ? { ...c, endDate: new Date(e.target.value).toISOString() } : c
                            )
                          )
                        }
                      />
                    </td>
                    <td className="py-2 text-xs text-neutral-600">{r._warn}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} className="py-2 text-right text-xs text-neutral-500">
                  Ready to upload: {readyCount} / {rows.length}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
}