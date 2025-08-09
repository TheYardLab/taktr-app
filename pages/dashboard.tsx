// pages/dashboard.tsx
import React, { useMemo, useEffect } from "react";
import Image from "next/image";
import withAuth from "@/pages/hoc/withAuth";

import { useProjectContext } from "@/lib/ProjectContext";
import { useTasksStore } from "@/components/hooks/useTasksStore";

import ProjectSelector from "@/components/ProjectSelector";
import UploadSchedule from "@/components/UploadSchedule";
import MetricsView from "@/components/MetricsView";
import CalendarView from "@/components/CalendarView";
import GanttView from "@/components/views/GanttView";
import TaktPlan from "@/components/TaktPlan";
import SCurve from "@/components/SCurve";

import { getAuth, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";

/** ---------- Empty state + sample data seeding ---------- */
function SeedSampleTasks() {
  const { projectId } = useProjectContext();
  const addMany = useTasksStore((s) => s.addMany);

  async function seed() {
    if (!projectId) return;
    const today = new Date();
    const iso = (d: Date) => d.toISOString().slice(0, 10);

    const s1 = new Date(today);
    const e1 = new Date(today); e1.setDate(e1.getDate() + 5);

    const s2 = new Date(today); s2.setDate(s2.getDate() + 3);
    const e2 = new Date(today); e2.setDate(e2.getDate() + 10);

    const s3 = new Date(today); s3.setDate(s3.getDate() + 11);
    const e3 = new Date(today); e3.setDate(e3.getDate() + 16);

    await addMany([
      { projectId, name: "Mobilize Site", status: "In Progress", startDate: iso(s1), endDate: iso(e1) },
      { projectId, name: "Foundations",   status: "Blocked",     startDate: iso(s2), endDate: iso(e2) },
      { projectId, name: "Framing",       status: "Not Started",  startDate: iso(s3), endDate: iso(e3) },
    ]);
  }

  return (
    <button onClick={seed} className="rounded bg-black px-3 py-1 text-white">
      Seed sample tasks
    </button>
  );
}

function EmptyState() {
  return (
    <div className="rounded border p-4 bg-amber-50 text-amber-900">
      <p className="mb-3">
        No tasks yet. Upload a CSV in <strong>Upload Schedule</strong> or seed a few sample tasks.
      </p>
      <SeedSampleTasks />
    </div>
  );
}

/** --------------------- Dashboard --------------------- */
const Dashboard: React.FC = () => {
  const { projectId } = useProjectContext();
  const { fetchTasks, tasks } = useTasksStore();

  // Subscribe to tasks whenever the active project changes
  useEffect(() => {
    if (projectId) fetchTasks();
  }, [projectId, fetchTasks]);

  // Normalize status for Gantt (maps "Completed" → "Done")
  const ganttTasks = useMemo(
    () =>
      (tasks || []).map((t: any) => ({
        ...t,
        status: t?.status === "Completed" ? "Done" : t?.status ?? "Not Started",
      })),
    [tasks]
  );

  const handleLogout = async () => {
    try {
      const auth = getAuth(app);
      await signOut(auth);
      window.location.href = "/login";
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="flex flex-wrap items-center justify-between gap-4 p-4 bg-sky-700">
        {/* Left: logo + title + project selector */}
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="Taktr" width={80} height={80} priority />
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <div>
            <ProjectSelector />
          </div>
        </div>

        {/* Right: logout */}
        <button
          onClick={handleLogout}
          className="rounded bg-white/10 px-3 py-1 text-white hover:bg-white/20"
        >
          Logout
        </button>
      </header>

      <main className="p-4 space-y-6">
        {/* Project status */}
        <div className="text-sm text-gray-600">
          {projectId ? (
            <span>
              Active project: <strong>{projectId}</strong>
            </span>
          ) : (
            <span>No project selected</span>
          )}
        </div>

        {/* Upload */}
        <section className="rounded border p-4">
          <h2 className="font-medium mb-3">Upload Schedule</h2>
          <UploadSchedule />
        </section>

        {/* Empty state helper */}
        {(!tasks || tasks.length === 0) && <EmptyState />}

        {/* Metrics + Calendar */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded border p-4">
            <h2 className="font-medium mb-3">Metrics</h2>
            <MetricsView tasks={tasks} />
          </div>
          <div className="rounded border p-4">
            <h2 className="font-medium mb-3">Calendar</h2>
            <CalendarView tasks={tasks} />
          </div>
        </section>

        {/* Gantt */}
        <section className="rounded border p-4">
          <h2 className="font-medium mb-3">Gantt</h2>
          <GanttView tasks={ganttTasks} dayWidth={28} />
        </section>

        {/* Takt Plan */}
        <section className="rounded border p-4">
          <h2 className="font-medium mb-3">Takt Plan</h2>
          <TaktPlan />
        </section>

        {/* S-Curve */}
      <section className="rounded border p-4">
  <h2 className="font-medium mb-3">S-Curve</h2>
  <SCurve tasks={tasks} />
</section>
      </main>
    </div>
  );
};

export default withAuth(Dashboard);