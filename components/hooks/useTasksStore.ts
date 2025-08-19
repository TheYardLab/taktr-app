// components/hooks/useTasksStore.ts
import { create } from "zustand";

/** Keep this union in sync with your views (Gantt/List/etc). */
export type TaskStatus =
  | "Not Started"
  | "In Progress"
  | "Blocked"
  | "Done"
  | "Completed";

/** Tasks coming from Firestore or uploads. Keep fields loose/flexible. */
export type Task = {
  id: string;
  projectId?: string;
  name: string;
  status?: TaskStatus | string;
  startDate?: any; // string | Date | Firestore Timestamp
  endDate?: any;   // string | Date | Firestore Timestamp
  [key: string]: any;
};

export type TasksStore = {
  // project meta
  projectId: string | null;
  projectMeta: { name: string | null } | null;

  // task data
  tasks: Task[];           // raw tasks for the selected project
  filteredTasks: Task[];   // filtered/sorted list for UI
  filterBy: string;

  // actions
  setProjectId: (id: string | null) => void;
  setProjectMeta: (id: string | null, name: string | null) => void;

  /** Placeholder – wire your Firestore query here later */
  fetchTasks: () => Promise<void>;

  /** Push new tasks into the store (also refreshes filteredTasks) */
  setTasks: (tasks: Task[]) => void;

  /** Update filter and recompute filteredTasks */
  setFilter: (term: string) => void;
};

function applyFilter(tasks: Task[], term: string): Task[] {
  if (!term) return tasks.slice();
  const q = term.toLowerCase();
  return tasks.filter((t) => {
    const name = (t.name ?? "").toLowerCase();
    const status = (String(t.status ?? "")).toLowerCase();
    return name.includes(q) || status.includes(q);
  });
}

export const useTasksStore = create<TasksStore>((set, get) => ({
  // state
  projectId: null,
  projectMeta: null,
  tasks: [],
  filteredTasks: [],
  filterBy: "",

  // actions
  setProjectId: (id) => set({ projectId: id }),

  setProjectMeta: (_id, name) => set({ projectMeta: { name } }),

  fetchTasks: async () => {
    // Wire Firestore here when you’re ready:
    // const { projectId } = get();
    // if (!projectId) return;
    // const snap = await getDocs(query(collection(db, "tasks"), where("projectId", "==", projectId)));
    // const tasks: Task[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    // get().setTasks(tasks);

    // Temporary no-op so callers don’t crash
    return;
  },

  setTasks: (tasks) => {
    const term = get().filterBy;
    set({
      tasks,
      filteredTasks: applyFilter(tasks, term),
    });
  },

  setFilter: (term) => {
    const { tasks } = get();
    set({
      filterBy: term,
      filteredTasks: applyFilter(tasks, term),
    });
  },
}));

// Re-export types so existing imports like
// `import { Task } from "@/components/hooks/useTasksStore"` continue to work.
export type { Task as DefaultTask };