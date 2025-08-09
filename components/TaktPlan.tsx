import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import CalendarView from './CalendarView';
import MetricsView from './MetricsView';
import { useTasksStore } from './hooks/useTasksStore';

type Props = {
  projectId?: string;
};

// If your store already exports TaskStatus, import it instead of re-declaring:
type TaskStatus = 'Not Started' | 'In Progress' | 'Completed';

export default function TaktPlan({ projectId }: Props) {
  const [view, setView] = useState<'gantt' | 'list' | 'calendar' | 'metrics'>('gantt');

  const {
    filteredTasks: tasks,
    fetchTasks,
    setSortBy,
    setFilter,
    updateTask,
    setProjectId,
  } = useTasksStore();

  // Pull tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Respect projectId coming from the page (so uploads, etc. know where to go)
  useEffect(() => {
    if (projectId) setProjectId(projectId);
  }, [projectId, setProjectId]);

  const handleStatusChange = (id: string, status: TaskStatus) => {
    updateTask(id, { status });
  };

  const handleDateChange = (id: string, field: 'startDate' | 'endDate', date: string) => {
    updateTask(id, { [field]: date });
  };

  return (
    <div className="p-4">
      {/* View Switcher */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`px-3 py-1 border rounded ${view === 'gantt' ? 'bg-blue-600 text-white' : 'bg-white'}`}
          onClick={() => setView('gantt')}
        >
          Gantt
        </button>
        <button
          className={`px-3 py-1 border rounded ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-white'}`}
          onClick={() => setView('list')}
        >
          List
        </button>
        <button
          className={`px-3 py-1 border rounded ${view === 'calendar' ? 'bg-blue-600 text-white' : 'bg-white'}`}
          onClick={() => setView('calendar')}
        >
          Calendar
        </button>
        <button
          className={`px-3 py-1 border rounded ${view === 'metrics' ? 'bg-blue-600 text-white' : 'bg-white'}`}
          onClick={() => setView('metrics')}
        >
          Metrics
        </button>
      </div>

      {/* Sorting & Filtering */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          onChange={(e) =>
            setSortBy(e.target.value as 'startDate' | 'endDate' | 'name')
          }
          className="border p-2 rounded"
          defaultValue="startDate"
        >
          <option value="startDate">Sort by Start Date</option>
          <option value="endDate">Sort by End Date</option>
          <option value="name">Sort by Task Name</option>
        </select>

        <input
          type="text"
          placeholder="Filter by keyword"
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Views */}
      {(view === 'gantt' || view === 'list') && (
        <div className="border p-2 bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-50">
                <th className="border px-2 py-1 text-left">Task Name</th>
                <th className="border px-2 py-1 text-left">Status</th>
                <th className="border px-2 py-1 text-left">Start Date</th>
                <th className="border px-2 py-1 text-left">End Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="border px-2 py-4 text-center text-sm text-gray-500">
                    No tasks yet.
                  </td>
                </tr>
              )}
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="border px-2 py-1">{task.name}</td>
                  <td className="border px-2 py-1">
                    <select
                      value={task.status ?? ''}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      className="border p-1 rounded"
                    >
                      <option value="">Select Status</option>
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="date"
                      value={task.startDate ? dayjs(task.startDate).format('YYYY-MM-DD') : ''}
                      onChange={(e) => handleDateChange(task.id, 'startDate', e.target.value)}
                      className="border p-1 rounded"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="date"
                      value={task.endDate ? dayjs(task.endDate).format('YYYY-MM-DD') : ''}
                      onChange={(e) => handleDateChange(task.id, 'endDate', e.target.value)}
                      className="border p-1 rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {view === 'gantt' && (
            <p className="text-xs text-gray-500 mt-2">
              (Gantt visualization will be added once we pick a library or ship the local view.)
            </p>
          )}
        </div>
      )}

      {view === 'calendar' && <CalendarView tasks={tasks} />}
      {view === 'metrics' && <MetricsView tasks={tasks} />}
    </div>
  );
}