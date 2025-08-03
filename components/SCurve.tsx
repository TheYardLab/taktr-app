import React from 'react';
import { useProject } from '@/lib/ProjectContext';
import { Line } from 'react-chartjs-2';

export default function SCurve() {
  const { scurve } = useProject();

  if (!scurve || scurve.length === 0) {
    return (
      <section id="scurve" className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold text-brand mb-4">S-Curve Forecast</h2>
        <p className="text-gray-500">No S-Curve data yet.</p>
      </section>
    );
  }

  const data = {
    labels: scurve.map(p => `Day ${p.day}`),
    datasets: [
      {
        label: 'Progress (%)',
        data: scurve.map(p => p.progress),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.3)',
        tension: 0.3
      }
    ]
  };

  return (
    <section id="scurve" className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold text-brand mb-4">S-Curve Forecast</h2>
      <Line data={data} />
    </section>
  );
}