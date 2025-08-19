import React from "react";
import { useTasksStore, type Task } from "./hooks/useTasksStore";

const TaktPlan: React.FC = () => {
  const tasks = useTasksStore((state) => state.tasks) as Task[];

  return (
    <div>
      <h2>Takt Plan</h2>
      {tasks.length === 0 ? (
        <p>No tasks found</p>
      ) : (
        <ul>
          {tasks.map((t) => (
            <li key={t.id}>
              {t.name} — {t.startDate ?? "—"} → {t.endDate ?? "—"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaktPlan;