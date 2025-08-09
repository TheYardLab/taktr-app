import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Task as BaseTask } from "@/lib/ProjectContext"; // adjust path if needed

type Task = BaseTask & {
  startDate?: string | Date;
  endDate?: string | Date;
};

export const GanttChartView = ({ tasks }: { tasks: Task[] }) => {
  const data = tasks.map((task) => ({
    name: task.name || "Unnamed",
    start: task.startDate ? new Date(task.startDate).getTime() : 0,
    end: task.endDate ? new Date(task.endDate).getTime() : 0,
    duration:
      task.startDate && task.endDate
        ? (new Date(task.endDate).getTime() -
            new Date(task.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
        : 0,
  }));

  return (
    <>
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">
          📊 Gantt-style Task Preview
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={["dataMin", "dataMax"]} hide />
            <YAxis type="category" dataKey="name" />
            <Tooltip />
            <Legend />
            <Bar dataKey="duration" fill="#8884d8" name="Duration (days)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export const exportToPdf = (tasks: Task[]) => {
  // Implementation placeholder or actual export logic
  console.log("Exporting to PDF", tasks);
};