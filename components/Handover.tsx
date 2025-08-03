import React from 'react';
import { useProject } from '@/lib/ProjectContext';

export default function Handover() {
  const { handovers } = useProject();

  return (
    <section id="handover" className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold text-brand mb-4">Handover Tracker</h2>
      {handovers.length === 0 ? (
        <p className="text-gray-500">No handovers detected yet.</p>
      ) : (
        <ul className="space-y-2">
          {handovers.map((h, index) => (
            <li key={index} className="p-2 bg-gray-100 rounded">
              {h.from} ➡ {h.to} on Day {h.day}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}