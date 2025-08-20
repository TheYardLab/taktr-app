import React, { useMemo, useState } from "react";
import Papa from "papaparse";
import { getAuth } from "firebase/auth";

type Props = {
  projectId: string;
};

type CsvRow = Record<string, string | number | null | undefined>;

type Mapping = {
  task?: string;
  trade?: string;
  subcontractor?: string;
  status?: string;
  start?: string;
  finish?: string;
  wagon?: string;
  train?: string;
  zone?: string;
  area?: string;
  duration?: string;
  predecessors?: string;
};

type UploadTask = {
  id?: string;
  name: string;
  status?: "Not Started" | "In Progress" | "Blocked" | "Done" | "Completed";
  startDate: string; // ISO
  endDate: string;   // ISO
  zone?: string | null;
  trade?: string | null;
};

const REQUIRED: (keyof Mapping)[] = ["task", "start", "finish"];

// helpers
function toISO(v: any): string | "" {
  if (v == null) return "";
  if (typeof v === "number") {
    // Excel serial coercion (1900 epoch)
    const base = new Date(Date.UTC(1899, 11, 30));
    const ms = v * 24 * 3600 * 1000;
    const d = new Date(base.getTime() + ms);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  }
  const s = String(v).trim();
  if (!s) return "";
  const tryDate = new Date(s);
  if (!Number.isNaN(tryDate.getTime())) {
    return tryDate.toISOString().slice(0, 10);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return "";
}

function normalizeStatusFreeform(s?: string): UploadTask["status"] {
  if (!s) return "Not Started";
  const t = s.toLowerCase();
  if (t.includes("complete")) return "Completed";
  if (t.includes("done")) return "Done";
  if (t.includes("block")) return "Blocked";
  if (t.includes("progress") || t.includes("wip") || t.includes("active"))
    return "In Progress";
  return "Not Started";
}

const FIELD_ROWS: Array<{ label: string; key: keyof Mapping }> = [
  { label: "Task", key: "task" },
  { label: "Trade", key: "trade" },
  { label: "Subcontractor", key: "subcontractor" },
  { label: "Status", key: "status" },
  { label: "Start", key: "start" },
  { label: "Finish", key: "finish" },
  { label: "Wagon", key: "wagon" },
  { label: "Train", key: "train" },
  { label: "Zone", key: "zone" },
  { label: "Area", key: "area" },
  { label: "Duration", key: "duration" },
  { label: "Predecessors", key: "predecessors" },
];

const UploadSchedule: React.FC<Props> = ({ projectId }) => {
  const [fileName, setFileName] = useState<string>("");
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Mapping>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const rowCount = rows.length;

  // parse csv
  const onChooseFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setMsg("");
    if (!f) return;
    setFileName(f.name);
    Papa.parse<CsvRow>(f, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => String(h || "").trim(),
      complete: (result) => {
        const data = (result.data || []).filter(Boolean);
        setRows(data);
        const hdrs = result.meta.fields?.map((h) => String(h)) || [];
        setHeaders(hdrs);

        // attempt auto-map by common names
        const lower = new Set(hdrs.map((h) => h.toLowerCase()));
        const guess = { ...mapping };
        const tryMap = (field: keyof Mapping, candidates: string[]) => {
          for (const c of candidates) {
            if (lower.has(c.toLowerCase())) {
              const found = hdrs.find((h) => h.toLowerCase() === c.toLowerCase());
              if (found) {
                (guess as any)[field] = found;
                break;
              }
            }
          }
        };

        tryMap("task", ["task", "name", "task name", "activity", "activity name"]);
        tryMap("trade", ["trade", "crew"]);
        tryMap("subcontractor", ["subcontractor", "vendor", "company"]);
        tryMap("status", ["status", "state"]);
        tryMap("start", ["start", "start date", "planned start", "start_date"]);
        tryMap("finish", ["finish", "end", "end date", "planned finish", "finish date", "finish_date"]);
        tryMap("zone", ["zone", "area", "location"]);
        tryMap("area", ["area"]);
        tryMap("wagon", ["wagon"]);
        tryMap("train", ["train"]);
        tryMap("duration", ["duration", "days"]);
        tryMap("predecessors", ["predecessors", "preds", "pred"]);

        setMapping(guess);
      },
      error: (err) => {
        console.error(err);
        setMsg(`CSV parse error: ${err?.message || String(err)}`);
      },
    });
    // allow re-selecting same file later
    e.currentTarget.value = "";
  };

  const canUpload = useMemo(() => {
    return REQUIRED.every((k) => !!(mapping as any)[k]) && rowCount > 0 && !busy;
  }, [mapping, rowCount, busy]);

  const preview = useMemo(() => rows.slice(0, 30), [rows]);

  const onChangeMap = (key: keyof Mapping, val: string) => {
    setMapping((m) => ({ ...m, [key]: val || undefined }));
  };

  const resetMapping = () => {
    setMapping({});
    setMsg("");
  };

  const buildPayload = (): UploadTask[] => {
    if (!rows.length) return [];
    const m = mapping;
    const out: UploadTask[] = [];

    for (const r of rows) {
      const name = (m.task ? String(r[m.task] ?? "") : "").trim();
      const startRaw = m.start ? r[m.start] : null;
      const finishRaw = m.finish ? r[m.finish] : null;
      const startDate = toISO(startRaw);
      const endDate = toISO(finishRaw);
      if (!name || !startDate || !endDate) continue;

      const t: UploadTask = {
        name,
        startDate,
        endDate,
        status: normalizeStatusFreeform(m.status ? String(r[m.status] ?? "") : undefined),
        trade: m.trade ? String(r[m.trade] ?? "").trim() || null : null,
        zone: m.zone ? String(r[m.zone] ?? "").trim() || null : null,
      };

      if (m.subcontractor) {
        const s = String(r[m.subcontractor] ?? "").trim();
        if (s) t.trade = t.trade ? `${t.trade} — ${s}` : s;
      }

      out.push(t);
    }
    return out;
  };

  const upload = async () => {
    try {
      setBusy(true);
      setMsg("");
      const tasks = buildPayload();
      if (tasks.length === 0) {
        setMsg("No valid rows to upload (check Task/Start/Finish mapping).");
        return;
      }

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setMsg("You must be logged in to upload.");
        return;
      }
      const token = await user.getIdToken();

      const res = await fetch("/api/uploadSchedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          tasks,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(`Upload failed: ${data?.error || res.statusText}`);
        return;
      }
      setMsg(`Uploaded ${data?.count ?? tasks.length} tasks.`);
    } catch (e: any) {
      setMsg(`Upload error: ${e?.message || String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-md border bg-white p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <label className="inline-flex items-center gap-2">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={onChooseFile}
            className="hidden"
            id="csv-input"
          />
          <span className="rounded border px-3 py-1.5 text-sm cursor-pointer">
            <label htmlFor="csv-input" className="cursor-pointer">Choose File</label>
          </span>
        </label>

        <button
          type="button"
          className="rounded border px-3 py-1.5 text-sm"
          onClick={resetMapping}
        >
          Reset Mapping
        </button>

        <button
          type="button"
          className={`rounded px-3 py-1.5 text-sm text-white ${canUpload ? "bg-blue-600" : "bg-gray-400 cursor-not-allowed"}`}
          onClick={upload}
          disabled={!canUpload}
          title={!canUpload ? "Map Task, Start, and Finish first" : "Upload to Project"}
        >
          {busy ? "Uploading…" : `Upload to Project (${projectId})`}
        </button>

        <div className="text-sm text-gray-600 ml-auto">
          {fileName ? `${fileName} — ` : ""}{rowCount} rows detected
        </div>
      </div>

      {/* Mapping grid */}
      <div className="rounded border bg-gray-50 p-3">
        <div className="mb-2 text-sm text-gray-600">
          Template: <span className="italic text-gray-500">(none)</span>{" "}
          <span className="ml-2 text-gray-400">
            Options come from your CSV header.
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="bg-white">
                <th className="px-3 py-2 text-left w-1/3">Taktr Field</th>
                <th className="px-3 py-2 text-left">Your Column</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {FIELD_ROWS.map(({ label, key }) => (
                <tr key={key} className="border-t">
                  <td className="px-3 py-2 font-medium">{label}</td>
                  <td className="px-3 py-2">
                    <select
                      className="w-full rounded border px-2 py-1"
                      value={(mapping as any)[key] ?? ""}
                      onChange={(e) => onChangeMap(key, e.target.value)}
                    >
                      <option value="">— Select a column —</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-3">
        <div className="mb-1 text-sm font-semibold">Preview</div>
        <div className="overflow-x-auto rounded border">
          <table className="min-w-[900px] w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                {FIELD_ROWS.map(({ label }) => (
                  <th key={label} className="px-2 py-1 text-left">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((r, i) => (
                <tr key={i} className="border-t">
                  {FIELD_ROWS.map(({ key }) => (
                    <td key={String(key)} className="px-2 py-1">
                      {mapping[key] ? String(r[mapping[key] as string] ?? "") : ""}
                    </td>
                  ))}
                </tr>
              ))}
              {preview.length === 0 && (
                <tr>
                  <td className="px-2 py-2 text-gray-500" colSpan={FIELD_ROWS.length}>
                    Load a CSV to see preview.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Messages */}
      {msg && (
        <div className="mt-3 rounded border bg-yellow-50 px-3 py-2 text-sm">
          {msg}
        </div>
      )}
    </div>
  );
};

export default UploadSchedule;