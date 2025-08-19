import React from "react";
import { useTasksStore, type Task } from "@/components/hooks/useTasksStore";

const ExportButtons: React.FC = () => {
  const tasks = useTasksStore((state) => state.tasks) as Task[];

  const exportToCSV = () => {
    const csv = [
      ["Name", "Start Date", "End Date", "Status"],
      ...tasks.map((t) => [t.name, t.startDate || "", t.endDate || "", t.status]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tasks.csv";
    link.click();
  };

  return (
    <div>
      <button onClick={exportToCSV}>Export CSV</button>
    </div>
  );
};

export default ExportButtons;