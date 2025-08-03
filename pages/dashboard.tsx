import Sidebar from '@/components/Sidebar';
import TaktPlan from '@/components/TaktPlan';
import Handover from '@/components/Handover';
import SCurve from '@/components/SCurve';
import Portfolio from '@/components/Portfolio';

export default function Dashboard() {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--brand-bg)' }}>
      <Sidebar />

      <main className="flex-1 ml-64 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section id="home" className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold text-brand mb-4">Welcome</h2>
          <p className="text-gray-700">
            Full Phase 1–14 functionality will be loaded here — Takt Plans, Handover, S-Curves, Metrics, Reports.
          </p>
        </section>

        <TaktPlan />
        <Handover />
        <SCurve />
        <Portfolio />
      </main>
    </div>
  );
}