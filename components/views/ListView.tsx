import React from "react";

// replace local Task type with this more flexible one
export type Task = {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  status?: string; // << allow any string
};

export type ListViewProps = {
  tasks: Task[];
};

export default function ListView({ tasks }: ListViewProps) {
  const rows = React.useMemo(
    () =>
      (tasks || []).map((t) => ({
        ...t,
        status: t.status === "Completed" ? ("Done" as const) : t.status,
      })),
    [tasks]
  );

  if (!rows.length) {
    return <div className="text-sm text-gray-500">No tasks to list.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2 pr-3">Task</th>
            <th className="py-2 pr-3">Status</th>
            <th className="py-2 pr-3">Start</th>
            <th className="py-2 pr-3">End</th>
            <th className="py-2 pr-3">ID</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} className="border-b">
              <td className="py-2 pr-3">{t.name}</td>
              <td className="py-2 pr-3">{t.status || "Not Started"}</td>
              <td className="py-2 pr-3">{t.startDate?.slice(0, 10) || "—"}</td>
              <td className="py-2 pr-3">{t.endDate?.slice(0, 10) || "—"}</td>
              <td className="py-2 pr-3 text-neutral-500">{t.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}