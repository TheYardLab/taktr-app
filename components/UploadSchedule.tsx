'use client';

import React, { useCallback } from 'react';
import Papa from 'papaparse';
import { useDropzone } from 'react-dropzone';
import { useProject } from '@/lib/ProjectContext';

export default function UploadSchedule() {
  const { setTasks, setMetrics, setSCurve, setHandovers } = useProject();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedTasks = results.data.map((row: any, index: number) => ({
            label: row.Task || `Task ${index + 1}`,
            trade: row.Trade || 'Unknown Trade',
            startDay: parseInt(row.StartDay || 0),
            finishDay: parseInt(row.FinishDay || 0),
            duration: parseInt(row.Duration || 0),
            completed: row.Completed === 'Yes',
            notes: row.Notes || '',
          }));

          // ✅ Update Project Context
          setTasks(parsedTasks);

          // ✅ Metrics calculation
          const totalTasks = parsedTasks.length;
          const completedTasks = parsedTasks.filter(t => t.completed).length;
          const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
          const avgDuration =
            totalTasks > 0
              ? parsedTasks.reduce((sum, t) => sum + (t.duration || 0), 0) / totalTasks
              : 0;

          setMetrics({
            totalTasks,
            completedTasks,
            completionRate,
            avgDuration
          });

          // ✅ S-Curve calculation (simplified)
          const scurvePoints = parsedTasks.map((t, i) => ({
            day: t.startDay,
            progress: (i / totalTasks) * 100,
            cumulative: ((i + 1) / totalTasks) * 100
          }));
          setSCurve(scurvePoints);

          // ✅ Handover detection — now includes `day`
          const handovers = parsedTasks.map((t, i) => ({
            fromTrade: t.trade,
            toTrade: parsedTasks[i + 1]?.trade || '',
            zone: `Zone ${i + 1}`,
            day: t.finishDay || t.startDay || i
          }));
          setHandovers(handovers);
        }
      });
    });
  }, [setTasks, setMetrics, setSCurve, setHandovers]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 cursor-pointer text-center transition ${
        isDragActive ? 'bg-blue-100 border-blue-400' : 'bg-gray-50 border-gray-300'
      }`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-blue-600 font-semibold">Drop the CSV file here...</p>
      ) : (
        <p className="text-gray-600">Drag & drop a project schedule CSV, or click to upload</p>
      )}
    </div>
  );
}