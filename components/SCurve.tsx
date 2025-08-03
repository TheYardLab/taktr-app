import React from 'react';
import { useProject } from '@/lib/ProjectContext';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

export default function SCurve() {
  const { scurve } = useProject();

  const chartData = {
    labels: scurve.map(point => `Day ${point.day}`),
    datasets: [
      {
        label: 'Progress',
        data: scurve.map(point => point.progress),
        borderColor: '#4f46e5',
        backgroundColor: '#4f46e5',
        tension: 0.3,
      },
      {
        label: 'Cumulative Progress',
        data: scurve.map(point => point.cumulative ?? 0),
        borderColor: '#22c55e',
        backgroundColor: '#22c55e',
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">📈 S-Curve Forecast</h2>
      {scurve.length === 0 ? (
        <p className="text-gray-500">No S-Curve data available.</p>
      ) : (
        <Line data={chartData} />
      )}
    </div>
  );
}