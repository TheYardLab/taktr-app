import React from "react";
import { useTasksStore, type Task } from "@/components/hooks/useTasksStore";

const Handover: React.FC = () => {
  const tasks = (useTasksStore((state) => state.filteredTasks) ?? []) as Task[];

  return (
    <div>
      <h2>Handover</h2>
      {tasks.length === 0 ? (
        <p>No tasks to hand over.</p>
      ) : (
        <ul>
          {tasks.map((t) => (
            <li key={t.id}>
              {t.name ?? "Untitled"} — {t.startDate ?? "—"} → {t.endDate ?? "—"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Handover;