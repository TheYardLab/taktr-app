'use client';

import React from 'react';
import { useProject } from '@/lib/ProjectContext';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// ✅ Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

export default function SCurve() {
  const { scurve } = useProject();

  // ✅ Build chart labels & datasets
  const labels = scurve.map(point => `Day ${point.day}`);
  const cumulativeData = scurve.map(point => point.cumulative ?? 0);
  const dailyProgressData = scurve.map(point => point.progress ?? 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Cumulative Progress',
        data: cumulativeData,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        tension: 0.3,
        fill: false,
      },
      {
        label: 'Daily Progress',
        data: dailyProgressData,
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.2)',
        tension: 0.3,
        fill: false,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'bottom' as const },
      title: { display: true, text: 'S-Curve Progress Tracking' }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { stepSize: 10 }
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">📈 S-Curve</h2>
      <Line data={data} options={options} />
    </div>
  );
}