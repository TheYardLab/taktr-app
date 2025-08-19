import React from "react";
import * as PC from "@/lib/ProjectContext";

// Shim: prefer exported hook, otherwise derive from exported context
const useProjectContext: () => { metrics?: { name: string; value: string | number }[] } =
  (PC as any).useProjectContext ??
  (() => React.useContext((PC as any).ProjectContext));

type MetricsItem = { name: string; value: string | number };

interface MetricsProps {
  metrics?: MetricsItem[];
}

export default function Metrics({ metrics }: MetricsProps) {
  // ProjectContext may or may not provide metrics; tolerate undefined.
  const ctx = useProjectContext() as { metrics?: MetricsItem[] } | undefined;
  const data: MetricsItem[] = metrics ?? ctx?.metrics ?? [];

  if (!data || data.length === 0) {
    return <div>No metrics available</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">📊 Metrics</h2>
      <ul>
        {data.map((m: MetricsItem, index: number) => (
          <li key={index}>
            {m.name}: {m.value}
          </li>
        ))}
      </ul>
    </div>
  );
}

// NOTE: Removed broken type re-exports that referenced non-exported types from ProjectContext.
// If you need these types elsewhere, export them from ProjectContext and import explicitly where used.