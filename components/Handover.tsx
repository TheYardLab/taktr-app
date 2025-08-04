'use client';

import React from 'react';
import type { Handover } from '@/lib/ProjectContext'; // ✅ type-only import
import { useProject } from '@/lib/ProjectContext';

export default function Handover() {
  const { handovers } = useProject();

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">🔄 Handovers</h2>
      {handovers.length === 0 ? (
        <p className="text-gray-500">No handovers scheduled yet.</p>
      ) : (
        handovers.map((handover: Handover, index) => (
          <div key={index} className="border p-2 mb-2 rounded">
            <p>
              From <strong>{handover.fromTrade}</strong> to <strong>{handover.toTrade}</strong> in zone{' '}
              <strong>{handover.zone}</strong>
            </p>
          </div>
        ))
      )}
    </div>
  );
}