'use client';

import React from 'react';
import type { Handover } from '../lib/ProjectContext'; // type-only
import { useProject } from '../lib/ProjectContext';

export default function HandoverComponent() {
  const { handovers } = useProject();

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">🔄 Handovers</h2>
      {handovers.length === 0 ? (
        <p className="text-gray-500">No handovers scheduled.</p>
      ) : (
        handovers.map((handover: Handover, index: number) => (
          <div
            key={index}
            className="border p-2 mb-2 rounded"
          >
            <p className="text-sm font-semibold">
              {handover.fromTrade} ➡ {handover.toTrade}
            </p>
            <p className="text-xs text-gray-500">
              Zone: {handover.zone} — Day {handover.day}
            </p>
          </div>
        ))
      )}
    </div>
  );
}