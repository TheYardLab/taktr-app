'use client';

import React from 'react';
import { useProject } from '@/lib/ProjectContext';

export default function Handover() {
  const { handovers } = useProject();

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">🔄 Handovers</h2>
      {handovers.length === 0 ? (
        <p className="text-gray-500">No handovers detected.</p>
      ) : (
        <ul className="divide-y">
          {handovers.map((handover, idx) => (
            <li key={idx} className="py-2 flex justify-between items-center">
              <span>
                {handover.fromTrade} ➡ {handover.toTrade}
                {handover.zone && <span className="text-gray-400"> ({handover.zone})</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}