'use client';
import React from 'react';
import { Dialog } from '@headlessui/react';

type ExportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
};

export default function ExportModal({
  isOpen,
  onClose,
  onExportPDF,
  onExportCSV,
}: ExportModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-white rounded-lg p-6 shadow-lg">
          <Dialog.Title className="text-lg font-bold mb-4">
            Export Project
          </Dialog.Title>
          <div className="flex gap-4">
            <button
              onClick={onExportPDF}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Export PDF
            </button>
            <button
              onClick={onExportCSV}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Export CSV
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}