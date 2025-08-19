import React from "react";
import { useTasksStore, type Task } from "@/components/hooks/useTasksStore";

const TaskSidebar: React.FC = () => {
  const tasks = useTasksStore((state) => state.tasks) as Task[];

  return (
    <aside>
      <h3>Tasks</h3>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>{t.name ?? "Untitled"}</li>
        ))}
      </ul>
    </aside>
  );
};

export default TaskSidebar;