'use client';

import React from 'react';
import { useProject, type Handover } from '@/lib/ProjectContext';

export default function Handover() {
  const { handovers } = useProject();

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">🔄 Handovers</h2>
      {handovers.length === 0 ? (
        <p className="text-gray-500">No handovers yet.</p>
      ) : (
        <ul className="space-y-2">
          {handovers.map((handover: Handover, idx: number) => (
            <li key={idx} className="border p-2 rounded">
              From <span className="font-semibold">{handover.fromTrade}</span> → 
              <span className="font-semibold"> {handover.toTrade}</span> in Zone {handover.zone}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}