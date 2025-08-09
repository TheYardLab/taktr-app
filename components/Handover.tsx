import React from "react";
import { useProjectContext, type Handover } from "@/lib/ProjectContext";

interface HandoverComponentProps {
  handovers?: Handover[];
}

export default function HandoverComponent({ handovers }: HandoverComponentProps) {
  const { activeProject } = useProjectContext();

  // Prefer prop if provided, fallback to context
  const resolvedHandovers: Handover[] =
    handovers ?? activeProject?.handovers ?? [];

  if (!resolvedHandovers.length) {
    return <div>No handover data available</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">📦 Handover</h2>
      <ul>
        {resolvedHandovers.map((h) => (
          <li key={h.id}>
            {h.description ?? h.name ?? 'No description'} - {h.status}
          </li>
        ))}
      </ul>
    </div>
  );
}