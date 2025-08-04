'use client';

import Sidebar from '@/components/Sidebar';
import TaktPlan from '@/components/TaktPlan';
import SCurve from '@/components/SCurve';
import Handover from '@/components/Handover';
import Metrics from '@/components/Metrics'; // 👈 New import
import UploadSchedule from '@/components/UploadSchedule';

export default function Dashboard() {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--brand-bg)' }}>
      
      {/* 🔹 Sidebar */}
      <Sidebar />

      {/* 🔹 Main Content */}
      <main className="flex-1 ml-64 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 🔹 Upload Schedule */}
        <section className="bg-white p-6 rounded shadow col-span-2">
          <h2 className="text-lg font-semibold text-brand mb-4">📤 Upload Schedule</h2>
          <UploadSchedule />
        </section>

        {/* 🔹 Takt Plan */}
        <section className="bg-white p-6 rounded shadow">
          <TaktPlan />
        </section>

        {/* 🔹 S-Curve */}
        <section className="bg-white p-6 rounded shadow">
          <SCurve />
        </section>

        {/* 🔹 Handover Tracker */}
        <section className="bg-white p-6 rounded shadow">
          <Handover />
        </section>

        {/* 🔹 Metrics (New Section) */}
        <section className="bg-white p-6 rounded shadow col-span-2">
          <Metrics />
        </section>

      </main>
    </div>
  );
}