'use client';

import Sidebar from '@/components/Sidebar';
import TaktPlan from '@/components/TaktPlan';
import SCurve from '@/components/SCurve';
import Handover from '@/components/Handover';
import Metrics from '@/components/Metrics';
import UploadSchedule from '@/components/UploadSchedule';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6">
        {/* Upload Schedule */}
        <UploadSchedule />

        {/* Metrics */}
        <Metrics />

        {/* Takt Plan */}
        <TaktPlan />

        {/* S-Curve */}
        <SCurve />

        {/* Handovers */}
        <Handover />
      </main>
    </div>
  );
}