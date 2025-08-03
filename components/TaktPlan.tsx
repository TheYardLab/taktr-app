import React, { useState, useEffect } from 'react';
import { useProject, Task } from '@/lib/ProjectContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import TaskSidebar from './TaskSidebar';
import { generateSCurve } from '@/lib/scurveUtils';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TaktPlan() {
  const { scheduleData, setSCurve } = useProject();
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null);

  // Placeholder chart data
  const chartData = {
    labels: scheduleData.map(task => task.label),
    datasets: [
      {
        label: 'Duration (days)',
        data: scheduleData.map(task => task.duration),
        backgroundColor: '#4f46e5',
      },
    ],
  };

  const handleTaskClick = (index: number) => {
    setSelectedTaskIndex(index);
  };

  const closeSidebar = () => {
    setSelectedTaskIndex(null);
  };

  useEffect(() => {
    const points = generateSCurve(scheduleData);
    setSCurve(points);
  }, [scheduleData, setSCurve]);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">📊 Takt Plan</h2>
      <Bar data={chartData} />
      <div className="mt-4">
        {scheduleData.map((task, index) => (
          <div
            key={index}
            onClick={() => handleTaskClick(index)}
            className="cursor-pointer hover:bg-gray-100 p-2 border-b"
          >
            {task.label} — {task.trade}
          </div>
        ))}
      </div>
      {selectedTaskIndex !== null && (
        <TaskSidebar taskIndex={selectedTaskIndex} onClose={closeSidebar} />
      )}
    </div>
  );
}