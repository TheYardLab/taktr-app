'use client';

import React from 'react';
import { useProject } from '../lib/ProjectContext';
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

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

export default function SCurve() {
  const { scurve } = useProject();

  const labels = scurve.map(point => `Day ${point.day}`);
  const progressData = scurve.map(point => point.progress || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'S-Curve Progress',
        data: progressData,
        borderColor: '#2563eb',
        tension: 0.3
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'bottom' as const },
      title: { display: true, text: 'S-Curve Forecast' }
    },
    scales: { y: { beginAtZero: true, max: 100 } }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">📈 S-Curve</h2>
      <Line data={data} options={options} />
    </div>
  );
}