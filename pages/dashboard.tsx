'use client';

import Sidebar from '@/components/Sidebar';
import TaktPlan from '@/components/TaktPlan';
import Handover from '@/components/Handover';
import SCurve from '@/components/SCurve';

export default function Dashboard() {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--brand-bg)' }}>
      <Sidebar />
      <main className="flex-1 ml-64 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaktPlan />
        <Handover />
        <SCurve />
      </main>
    </div>
  );
}