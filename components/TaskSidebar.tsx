import React from "react";
import { useProjectContext } from "@/lib/ProjectContext";

export default function TaskSidebar() {
  const { tasks } = useProjectContext();

  return (
    <div className="p-4 border-r w-64">
      <h2 className="font-bold mb-2">📝 Tasks</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.name} - {task.status}
          </li>
        ))}
      </ul>
    </div>
  );
}