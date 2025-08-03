import React from 'react';
import { useProject } from '@/lib/ProjectContext';

export default function Handover() {
  const { handovers } = useProject();

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">🔄 Handover Tracker</h2>
      {handovers.length === 0 ? (
        <p className="text-gray-500">No handovers detected yet.</p>
      ) : (
        <ul className="space-y-2">
          {handovers.map((handover, index) => (
            <li
              key={index}
              className="p-2 border rounded hover:bg-gray-50 flex justify-between"
            >
              <span>
                <strong>{handover.from}</strong> ➡ <strong>{handover.to}</strong>
              </span>
              <span className="text-sm text-gray-500">Day {handover.day}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}