// components/DashboardLayout.tsx
'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Dashboard Header Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Dashboard</h1>
            <p className="mt-1 text-gray-600">
              Overview of your Takt Plan, tasks, and project performance metrics.
            </p>
          </div>

          {/* Render page-specific children */}
          {children}
        </main>
      </div>
    </div>
  );
}
