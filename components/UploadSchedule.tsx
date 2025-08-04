'use client';

import React from 'react';
import Papa from 'papaparse';
import { useProject, Task } from '@/lib/ProjectContext';
import { generateHandovers } from '@/lib/handoverUtils';
import { generateSCurve } from '@/lib/scurveUtils';
import { generateMetrics } from '@/lib/metricsUtils';

export default function UploadSchedule() {
  const { setTasks, setHandovers, setSCurve, setMetrics } = useProject();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        // 1️⃣ Parse tasks
        const parsedTasks: Task[] = results.data.map((row: any) => ({
          label: row.Task || 'Unnamed Task',
          trade: row.Trade || 'Unknown',
          startDay: parseInt(row.StartDay) || 0,
          finishDay: parseInt(row.FinishDay) || 0,
          duration: parseInt(row.Duration) || 0,
          notes: row.Notes || '',
          completed: row.Completed?.toLowerCase() === 'yes', // ✅ PPC tracking
        }));

        // 2️⃣ Save tasks
        setTasks(parsedTasks);

        // 3️⃣ Generate Handovers
        const generatedHandovers = generateHandovers(parsedTasks);
        setHandovers(generatedHandovers);

        // 4️⃣ Generate SCurve
        const scurvePoints = generateSCurve(parsedTasks);
        setSCurve(scurvePoints);

        // 5️⃣ Generate Metrics
        const generatedMetrics = generateMetrics(parsedTasks);
        setMetrics(generatedMetrics);

        console.log('✅ Tasks loaded:', parsedTasks);
        console.log('✅ Handovers generated:', generatedHandovers);
        console.log('✅ SCurve generated:', scurvePoints);
        console.log('✅ Metrics generated:', generatedMetrics);
      },
    });
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">📤 Upload Schedule</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="border p-2 rounded w-full"
      />
    </div>
  );
}