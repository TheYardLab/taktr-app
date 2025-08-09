'use client';
import React, { useState } from 'react';
import { useProjectContext } from '@/lib/ProjectContext';
import ExportModal from './ExportModal';
import { exportProjectAsPDF, exportProjectAsCSV } from '@/lib/exportUtils';

export default function ExportButtons() {
  const { activeProject } = useProjectContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!activeProject) return null;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
      >
        Export
      </button>
      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExportPDF={() => {
          exportProjectAsPDF(activeProject);
          setIsModalOpen(false);
        }}
        onExportCSV={() => {
          exportProjectAsCSV(activeProject);
          setIsModalOpen(false);
        }}
      />
    </>
  );
}