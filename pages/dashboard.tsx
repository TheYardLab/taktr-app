// pages/dashboard.tsx
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { ProjectProvider } from "@/lib/ProjectContext";
import { db } from "@/lib/firebase";
import { getAuth, signOut } from "firebase/auth";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import Resizable from "@/components/ui/Resizable";

/* ---------------------------- Helpers & types ---------------------------- */
const FallbackBox: React.FC<{ message: string }> = ({ message }) => (
  <div className="rounded border p-3 text-sm text-gray-600">{message}</div>
);

type UIEditableTask = {
  id: string;
  name: string;
  trade?: string;
  subcontractor?: string;
  status?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
};

const toYMD = (d: Date | number | null | undefined) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${m}-${day}`;
};

const fromAnyDate = (v: any): string => {
  if (!v) return "";
  if (typeof v === "string") return (v.split("T")[0] || v) as string;
  if (v?.seconds) return toYMD(v.seconds * 1000);
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : toYMD(d);
};

async function fileToDataURL(file: File): Promise<string> {
  if (!file) return "";
  await new Promise((r) => setTimeout(r, 0));
  return await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error("Failed to read file"));
    fr.onload = () => resolve(String(fr.result || ""));
    fr.readAsDataURL(file);
  });
}

/* ------------------------------- Dynamic UI ------------------------------ */
// Upload bar (components/UploadSchedule.tsx)
const UploadSchedule = dynamic<{ projectId: string }>(
  () =>
    import("@/components/UploadSchedule").then((m) => m.default).catch(() => ({
      default: ({ projectId }: { projectId: string }) => (
        <FallbackBox message={`UploadSchedule not found. Create components/UploadSchedule.tsx (project: ${projectId}).`} />
      ),
    })),
  { ssr: false }
);

// Takt Plan (components/TaktPlanSection.tsx)
const TaktPlanExternal = dynamic(
  () =>
    import("@/components/TaktPlanSection").then((m) => m.default).catch(() => ({
      default: ({ projectId }: { projectId: string }) => (
        <FallbackBox message={`TaktPlanSection not found. Create components/TaktPlanSection.tsx (project: ${projectId}).`} />
      ),
    })),
  { ssr: false }
) as React.ComponentType<{ projectId: string }>;

// Gantt (components/views/GanttView.tsx)
const GanttExternal = dynamic<{ projectId: string }>(
  () =>
    import("@/components/views/GanttView")
      .then((m) => (m.default as unknown) as React.ComponentType<{ projectId: string }>)
      .catch(() => ({
        default: ({ projectId }: { projectId: string }) => (
          <FallbackBox message={`GanttView not found. Create components/views/GanttView.tsx (project: ${projectId}).`} />
        ),
      })),
  { ssr: false }
);

// S-Curve (components/SCurve.tsx) — expects { tasks }
const SCurveExternal = dynamic(
  () =>
    import("@/components/SCurve")
      .then((m) => (m.default as unknown) as React.ComponentType<any>)
      .catch(() => ({
        default: ({ tasks }: { tasks: UIEditableTask[] }) => (
          <FallbackBox message={`SCurve component not found. Create components/SCurve.tsx. (Got ${tasks.length} tasks)`} />
        ),
      })),
  { ssr: false }
) as React.ComponentType<{ tasks: UIEditableTask[] }>;

/* ------------------------------ Project hooks ---------------------------- */
function fetchTasksSnapshot(projectId: string, setter: (rows: UIEditableTask[]) => void) {
  // No orderBy — include ALL tasks; sort client-side so tasks without startDate aren’t dropped.
  const colRef = collection(db, "projects", projectId, "tasks");
  return onSnapshot(colRef, (snap) => {
    const list: UIEditableTask[] = [];
    snap.forEach((d) => {
      const data = d.data() as any;
      list.push({
        id: d.id,
        name: data.name || data.task || "",
        trade: data.trade || "",
        subcontractor: data.subcontractor || data.vendor || "",
        status: (data.status || "").toString(),
        startDate: fromAnyDate(data.startDate || data.start || data.plannedStart),
        endDate: fromAnyDate(data.endDate || data.finish || data.plannedFinish),
      });
    });
    // Sort client-side: startDate asc, then name
    list.sort((a, b) => {
      const as = a.startDate || "";
      const bs = b.startDate || "";
      if (as && bs && as !== bs) return as.localeCompare(bs);
      if (as && !bs) return -1;
      if (!as && bs) return 1;
      return (a.name || "").localeCompare(b.name || "");
    });
    setter(list);
  });
}

function useProjectTasks(projectId: string) {
  const [tasks, setTasks] = useState<UIEditableTask[]>([]);
  useEffect(() => {
    if (!projectId) return;
    const unsub = fetchTasksSnapshot(projectId, setTasks);
    return () => unsub();
  }, [projectId]);
  return tasks;
}

/* --------------------------------- Tasks ---------------------------------- */
function TasksView({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<UIEditableTask[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const unsub = fetchTasksSnapshot(projectId, setTasks);
    return () => unsub();
  }, [projectId]);

  const onFieldChange = async (id: string, key: keyof UIEditableTask, value: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, [key]: value } : t)));
    setSavingId(id);
    try {
      const ref = doc(db, "projects", projectId, "tasks", id);
      const payload: any = {};
      if (key === "name") payload.name = value;
      else if (key === "trade") payload.trade = value;
      else if (key === "subcontractor") payload.subcontractor = value;
      else if (key === "status") payload.status = value;
      else if (key === "startDate") payload.startDate = value || null;
      else if (key === "endDate") payload.endDate = value || null;
      await updateDoc(ref, payload);
    } finally {
      setSavingId(null);
    }
  };

  const addTask = async () => {
    setAdding(true);
    try {
      await addDoc(collection(db, "projects", projectId, "tasks"), {
        name: "New Task",
        trade: "",
        subcontractor: "",
        status: "not started",
        startDate: toYMD(new Date()),
        endDate: toYMD(Date.now() + 24 * 3600 * 1000),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } finally {
      setAdding(false);
    }
  };

  const removeTask = async (id: string) => {
    await deleteDoc(doc(db, "projects", projectId, "tasks", id));
  };

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold">Tasks</h3>
        <button
          onClick={addTask}
          disabled={adding}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          {adding ? "Adding…" : "Add Task"}
        </button>
      </div>

      <div className="overflow-auto rounded border">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">Trade</th>
              <th className="px-3 py-2">Task</th>
              <th className="px-3 py-2">Subcontractor</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Start</th>
              <th className="px-3 py-2">Finish</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border px-2 py-1"
                    value={t.trade || ""}
                    onChange={(e) => onFieldChange(t.id, "trade", e.target.value)}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border px-2 py-1"
                    value={t.name}
                    onChange={(e) => onFieldChange(t.id, "name", e.target.value)}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border px-2 py-1"
                    value={t.subcontractor || ""}
                    onChange={(e) => onFieldChange(t.id, "subcontractor", e.target.value)}
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    className="w-full rounded border px-2 py-1"
                    value={t.status || ""}
                    onChange={(e) => onFieldChange(t.id, "status", e.target.value)}
                  >
                    <option value="not started">Not Started</option>
                    <option value="in progress">In Progress</option>
                    <option value="done">Done</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="date"
                    className="rounded border px-2 py-1"
                    value={t.startDate || ""}
                    onChange={(e) => onFieldChange(t.id, "startDate", e.target.value)}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="date"
                    className="rounded border px-2 py-1"
                    value={t.endDate || ""}
                    onChange={(e) => onFieldChange(t.id, "endDate", e.target.value)}
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => removeTask(t.id)}
                    className="rounded bg-red-600 px-2 py-1 text-xs text-white"
                  >
                    Delete
                  </button>
                  {savingId === t.id && (
                    <span className="ml-2 text-xs text-gray-500">Saving…</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------ Calendar View ----------------------------- */
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfWeek = (d: Date) => {
  const x = new Date(d);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
};

function CalendarView({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<UIEditableTask[]>([]);
  const [mode, setMode] = useState<"list" | "month">("month");
  const [cursor, setCursor] = useState(new Date());

  useEffect(() => {
    const unsub = fetchTasksSnapshot(projectId, setTasks);
    return () => unsub();
  }, [projectId]);

  if (mode === "list") {
    const sorted = [...tasks].sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""));
    return (
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold">Calendar (List)</h3>
          <button className="rounded border px-3 py-1.5 text-sm" onClick={() => setMode("month")}>
            Month View
          </button>
        </div>
        <ul className="space-y-2">
          {sorted.map((t) => (
            <li key={t.id} className="rounded border p-2">
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-gray-600">
                {t.trade ? `${t.trade} • ` : ""}
                {t.subcontractor || ""}
              </div>
              <div className="text-xs text-gray-600">
                {t.startDate || "?"} → {t.endDate || "?"}
              </div>
              <div className="text-xs">Status: {t.status || "not set"}</div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const monthStart = startOfMonth(cursor);
  const gridStart = startOfWeek(monthStart);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push(d);
  }

  const tasksByDay = new Map<string, UIEditableTask[]>();
  for (const t of tasks) {
    if (!t.startDate) continue;
    const key = t.startDate; // group by start date
    const arr = tasksByDay.get(key) || [];
    arr.push(t);
    tasksByDay.set(key, arr);
  }

  const monthLabel = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="rounded border px-2 py-1 text-sm"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            ◀
          </button>
          <div className="text-base font-semibold">{monthLabel}</div>
          <button
            className="rounded border px-2 py-1 text-sm"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            ▶
          </button>
        </div>
        <button className="rounded border px-3 py-1.5 text-sm" onClick={() => setMode("list")}>
          List View
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-xs">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="px-2 py-1 text-center font-semibold text-gray-600">
            {d}
          </div>
        ))}
        {cells.map((d, idx) => {
          const ymd = toYMD(d);
          const inMonth = d.getMonth() === cursor.getMonth();
          const items = tasksByDay.get(ymd) || [];
          return (
            <div
              key={idx}
              className={`min-h-[90px] rounded border p-1 ${
                inMonth ? "bg-white" : "bg-gray-50 text-gray-400"
              }`}
            >
              <div className="mb-1 text-right text-[10px]">{d.getDate()}</div>
              <div className="space-y-1">
                {items.map((t) => (
                  <div key={t.id} className="truncate rounded bg-blue-100 px-1 py-0.5">
                    {t.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ Dashboard page ---------------------------- */
type UIProject = { id: string; name: string };

export default function Dashboard() {
  const router = useRouter();

  const [projects, setProjects] = useState<UIProject[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [projErr, setProjErr] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [membershipReady, setMembershipReady] = useState(false);

  const pageTitle = useMemo(
    () => `Taktr — ${projects.find((p) => p.id === projectId)?.name || projectId || "Dashboard"}`,
    [projects, projectId]
  );

  // Export PDF (entire current view container)
  const exportCurrentView = async () => {
    try {
      const root = document.getElementById("export-root");
      if (!root) {
        alert("Nothing to export");
        return;
      }
      const mod = await import("@/lib/exportToPdf");
      // @ts-ignore
      await mod.exportElementToPdf(
        root,
        `Taktr-${projects.find((p) => p.id === projectId)?.name || "Dashboard"}-${tab}.pdf`
      );
    } catch (e) {
      console.error("Export failed", e);
      alert("Export failed. See console for details.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      router.push("/login");
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  // NEW: create project prompt INSIDE the component (so it has access to state + router)
  async function handleCreateProject() {
    try {
      const name = window.prompt("Project name?")?.trim();
      if (!name) return;

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert("You must be signed in to create a project.");
        return;
      }

      const projRef = await addDoc(collection(db, "projects"), {
        name,
        ownerId: user.uid,
        members: { [user.uid]: true },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const newId = projRef.id;
      setProjectId(newId);
      if (typeof window !== "undefined") localStorage.setItem("lastProjectId", newId);

      setProjects((prev) => {
        const next = [...prev, { id: newId, name }];
        next.sort((a, b) => a.name.localeCompare(b.name));
        return next;
      });

      router.replace({ pathname: "/dashboard", query: { projectId: newId } }, undefined, {
        shallow: true,
      });
    } catch (e: any) {
      console.error("create project failed:", e);
      alert(`Create project failed: ${e?.message || String(e)}`);
    }
  }

  // Load projects and pick current
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "projects"),
      (snap) => {
        const rows: UIProject[] = [];
        snap.forEach((d) => {
          const n = (d.data() as any)?.name || d.id;
          rows.push({ id: d.id, name: n });
        });
        rows.sort((a, b) => a.name.localeCompare(b.name));
        setProjects(rows);

        const qs = (router.query.projectId as string) || "";
        const last = typeof window !== "undefined" ? localStorage.getItem("lastProjectId") : "";
        const pick =
          (qs && rows.find((r) => r.id === qs)?.id) ||
          (last && rows.find((r) => r.id === last)?.id) ||
          rows[0]?.id ||
          "";
        setProjectId(pick);
        if (pick && typeof window !== "undefined") localStorage.setItem("lastProjectId", pick);
      },
      (err) => {
        console.error("Projects subscription error", err);
        setProjErr(err?.message || "Unable to load projects. Check Firestore rules/connection.");
      }
    );
    return () => unsub();
  }, [router.query.projectId]);

  // Ensure current user is member on BOTH shapes for selected project
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setMembershipReady(false);
      const u = getAuth().currentUser;
      if (!u || !projectId) {
        if (!cancelled) setMembershipReady(true);
        return;
      }
      try {
        // 1) Project doc map: members.{uid} = true
        await setDoc(
          doc(db, "projects", projectId),
          { members: { [u.uid]: true } },
          { merge: true }
        );
        // 2) Subcollection doc (compat)
        await setDoc(
          doc(db, "projects", projectId, "members", u.uid),
          { uid: u.uid, role: "member", lastSeenAt: serverTimestamp() },
          { merge: true }
        );
      } catch (err) {
        console.error("Membership upsert failed:", err);
      } finally {
        if (!cancelled) setMembershipReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const [tab, setTab] = useState<"takt" | "tasks" | "calendar" | "gantt" | "metrics" | "scurve">(
    "takt"
  );

  // Tasks for S-Curve/Metrics
  const tasks = useProjectTasks(projectId);

  const currentProjectName = useMemo(
    () => projects.find((p) => p.id === projectId)?.name || projectId || "—",
    [projects, projectId]
  );

  const inlineMetrics = useMemo(() => {
    const total = tasks.length;
    const status = (s?: string) => (s || "").toLowerCase();
    const done = tasks.filter((t) => ["done", "completed"].includes(status(t.status))).length;
    const inProg = tasks.filter((t) => status(t.status) === "in progress").length;
    const notStarted = total - done - inProg;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { total, done, inProg, notStarted, pct };
  }, [tasks]);

  // Persisted export logo preview (if your exportToPdf writes localStorage)
  const [exportLogoPreview, setExportLogoPreview] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const mod: any = await import("@/lib/exportToPdf");
        if (typeof mod.getStoredLogo === "function") {
          const saved = mod.getStoredLogo();
          if (saved) setExportLogoPreview(saved);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <div className="mx-auto w-full max-w-screen-2xl p-4 overflow-x-hidden bg-gray-50 min-h-screen text-gray-900">
        {/* Header */}
        <div className="mb-4 rounded border bg-white p-3 shadow flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Image
              src="/Logo.png"
              alt="Taktr"
              width={120}
              height={28}
              className="hidden h-7 w-auto sm:block"
              onError={(e) => {
                (e.currentTarget as any).currentTarget.style.display = "none";
              }}
              unoptimized
            />
            <div className="text-xl font-semibold">Project:</div>
            <select
              className="rounded border px-2 py-1"
              value={projectId}
              onChange={(e) => {
                const v = e.target.value;
                setProjectId(v);
                if (typeof window !== "undefined") localStorage.setItem("lastProjectId", v);
                router.replace({ pathname: "/dashboard", query: { projectId: v } }, undefined, {
                  shallow: true,
                });
              }}
            >
              {projects.length === 0 ? (
                <option value="">(no projects)</option>
              ) : (
                projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))
              )}
            </select>
            <button
              type="button"
              className="ml-2 rounded border px-2 py-1 text-sm"
              onClick={handleCreateProject}
              disabled={creating}
            >
              {creating ? "Creating…" : "New"}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Logo upload for PDF (compatible with zero-arg or one-arg helpers) */}
            <label className="rounded px-2 py-1.5 text-sm border cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  try {
                    const f = e.target.files?.[0];
                    const mod: any = await import("@/lib/exportToPdf");

                    if (typeof mod.chooseAndStoreLogo === "function") {
                      // If helper expects a file, pass it; if zero-arg, call without.
                      if (mod.chooseAndStoreLogo.length >= 1 && f) {
                        await mod.chooseAndStoreLogo(f);
                      } else {
                        await mod.chooseAndStoreLogo();
                      }
                    } else {
                      // Fallback: store dataURL directly
                      if (!f) return;
                      const dataUrl = await fileToDataURL(f);
                      const key = (mod.EXPORT_LOGO_KEY as string) || "taktr.export.logo";
                      try {
                        localStorage.setItem(key, dataUrl);
                      } catch {
                        /* ignore quota errors */
                      }
                    }

                    // Refresh local preview if available
                    if (typeof mod.getStoredLogo === "function") {
                      const saved = mod.getStoredLogo();
                      if (saved) setExportLogoPreview(saved);
                    } else {
                      const key = (mod.EXPORT_LOGO_KEY as string) || "taktr.export.logo";
                      const saved = localStorage.getItem(key) || "";
                      if (saved) setExportLogoPreview(saved);
                    }

                    alert("Logo saved for PDF exports.");
                  } catch (err) {
                    console.error(err);
                    alert("Unable to save logo.");
                  } finally {
                    e.currentTarget.value = "";
                  }
                }}
              />
              Upload Export Logo
            </label>
            {exportLogoPreview ? (
              <Image
                src={exportLogoPreview}
                alt="Export logo preview"
                width={120}
                height={24}
                className="rounded border bg-white"
                unoptimized
              />
            ) : null}

            <button
              className={`rounded px-3 py-1.5 text-sm border ${tab === "takt" ? "bg-blue-600 text-white" : ""}`}
              onClick={() => setTab("takt")}
            >
              Takt Plan
            </button>
            <button
              className={`rounded px-3 py-1.5 text-sm border ${tab === "tasks" ? "bg-blue-600 text-white" : ""}`}
              onClick={() => setTab("tasks")}
            >
              Task View
            </button>
            <button
              className={`rounded px-3 py-1.5 text-sm border ${tab === "calendar" ? "bg-blue-600 text-white" : ""}`}
              onClick={() => setTab("calendar")}
            >
              Calendar
            </button>
            <button
              className={`rounded px-3 py-1.5 text-sm border ${tab === "gantt" ? "bg-blue-600 text-white" : ""}`}
              onClick={() => setTab("gantt")}
            >
              Gantt
            </button>
            <button
              className={`rounded px-3 py-1.5 text-sm border ${tab === "metrics" ? "bg-blue-600 text-white" : ""}`}
              onClick={() => setTab("metrics")}
            >
              Metrics
            </button>
            <button
              className={`rounded px-3 py-1.5 text-sm border ${tab === "scurve" ? "bg-blue-600 text-white" : ""}`}
              onClick={() => setTab("scurve")}
            >
              S Curve
            </button>
            <button className="rounded px-3 py-1.5 text-sm border" onClick={exportCurrentView}>
              Export PDF
            </button>
          </div>

          <div className="ml-auto">
            <button
              type="button"
              onClick={handleLogout}
              className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        </div>

        {/* No project yet */}
        {!projectId ? (
          <div className="rounded border p-4">
            <div className="mb-2 text-gray-700">No projects found.</div>
            {projErr && (
              <div className="mb-3 rounded border border-red-300 bg-red-50 p-2 text-sm text-red-700">
                {projErr}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                onClick={handleCreateProject}
                disabled={creating}
              >
                {creating ? "Creating…" : "Create Project"}
              </button>
              <button
                type="button"
                className="rounded border px-3 py-1.5 text-sm"
                onClick={handleCreateProject}
                disabled={creating}
              >
                Quick Create
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              After creating, you can upload a CSV using the Upload bar to add tasks.
            </p>
          </div>
        ) : (
          <ProjectProvider>
            {/* Gate until membership is written so API routes won't 403 */}
            {!membershipReady ? (
              <div className="rounded border bg-white p-3 text-sm text-gray-600">
                Preparing project access…
              </div>
            ) : (
              <>
                {/* Upload */}
                <div className="mb-4 overflow-x-auto">
                  <div className="min-w-[1200px]">
                    <UploadSchedule projectId={projectId} />
                  </div>
                </div>

                {/* Views (export root wraps the whole thing so the full plan is captured) */}
                <div id="export-root" className="rounded bg-white p-3 shadow overflow-visible">
                  {tab === "takt" ? (
                    <Resizable
                      key={`takt-${projectId}`}
                      storageKey={`takt:${projectId}`}
                      defaultSize={640}
                      minSize={360}
                      direction="vertical"
                      className="min-w-[1000px]"
                    >
                      <TaktPlanExternal projectId={projectId} />
                    </Resizable>
                  ) : tab === "tasks" ? (
                    <Resizable
                      key={`tasks-${projectId}`}
                      storageKey={`tasks:${projectId}`}
                      defaultSize={600}
                      minSize={360}
                      direction="vertical"
                    >
                      <TasksView projectId={projectId} />
                    </Resizable>
                  ) : tab === "calendar" ? (
                    <Resizable
                      key={`cal-${projectId}`}
                      storageKey={`calendar:${projectId}`}
                      defaultSize={700}
                      minSize={420}
                      direction="vertical"
                    >
                      <CalendarView projectId={projectId} />
                    </Resizable>
                  ) : tab === "gantt" ? (
                    <Resizable
                      key={`gantt-${projectId}`}
                      storageKey={`gantt:${projectId}`}
                      defaultSize={640}
                      minSize={360}
                      direction="both"
                      className="min-w-[1100px]"
                    >
                      <GanttExternal projectId={projectId} />
                    </Resizable>
                  ) : tab === "metrics" ? (
                    <Resizable
                      key={`metrics-${projectId}`}
                      storageKey={`metrics:${projectId}`}
                      defaultSize={460}
                      minSize={300}
                      direction="vertical"
                    >
                      <div className="rounded border p-4 h-full">
                        <div className="mb-2 text-base font-semibold">Metrics</div>
                        <div className="text-sm">Total Tasks: {inlineMetrics.total}</div>
                        <div className="text-sm">Done/Completed: {inlineMetrics.done}</div>
                        <div className="text-sm">In Progress: {inlineMetrics.inProg}</div>
                        <div className="text-sm">Not Started: {inlineMetrics.notStarted}</div>
                        <div className="mt-2 text-sm">Completion: {inlineMetrics.pct}%</div>
                      </div>
                    </Resizable>
                  ) : (
                    <Resizable
                      key={`scurve-${projectId}`}
                      storageKey={`scurve:${projectId}`}
                      defaultSize={520}
                      minSize={320}
                      direction="vertical"
                      className="min-w-[900px]"
                    >
                      <SCurveExternal tasks={tasks} />
                    </Resizable>
                  )}
                </div>
              </>
            )}
          </ProjectProvider>
        )}
      </div>
    </>
  );
}