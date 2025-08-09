// components/hooks/useTasksStore.ts
import { create } from "zustand";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Keep TaskStatus broad enough to interop with all views.
 * (Gantt expects "Not Started" | "In Progress" | "Blocked" | "Done")
 * You may also still have "Completed" in older data.
 */
export type TaskStatus =
  | "Not Started"
  | "In Progress"
  | "Blocked"
  | "Done"
  | "Completed";

export interface Task {
  id: string;
  projectId: string;   // REQUIRED for persistence & filtering
  name: string;
  status?: TaskStatus;
  startDate?: string;  // ISO "YYYY-MM-DD" or full ISO
  endDate?: string;    // ISO
}

// ---------- Helpers ----------
const asDate = (value?: string) => (value ? new Date(value) : undefined);

const compareBy = (
  a: Task,
  b: Task,
  sortBy: "startDate" | "endDate" | "status" | "name"
) => {
  if (sortBy === "startDate" || sortBy === "endDate") {
    const da = asDate(a[sortBy]);
    const dbv = asDate(b[sortBy]);
    if (!da && !dbv) return 0;
    if (!da) return 1;
    if (!dbv) return -1;
    return da.getTime() - dbv.getTime();
  }
  // status / name
  return (a[sortBy] ?? "").localeCompare(b[sortBy] ?? "");
};

// ---------- Store ----------
interface TasksStore {
  // state
  projectId: string | null;
  tasks: Task[];
  filteredTasks: Task[];
  sortBy: "startDate" | "endDate" | "status" | "name";
  filterBy: string;
  loading: boolean;
  error: string | null;

  // actions
  setProjectId: (projectId: string | null) => void;
  setSortBy: (sortBy: TasksStore["sortBy"]) => void;
  setFilter: (filterBy: string) => void;

  fetchTasks: () => void; // subscribes to current project's subcollection
  addTask: (task: Omit<Task, "id">) => Promise<string>;
  addMany: (tasks: Omit<Task, "id">[]) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  clear: () => void;
}

export const useTasksStore = create<TasksStore>((set, get) => {
  let unsubscribe: Unsubscribe | null = null;

  const reapplyFilters = (tasks: Task[]) => {
    const { filterBy, sortBy } = get();
    let list = tasks;

    if (filterBy) {
      const term = filterBy.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(term) ||
          (t.status ?? "").toLowerCase().includes(term)
      );
    }

    list = [...list].sort((a, b) => compareBy(a, b, sortBy));
    set({ tasks, filteredTasks: list, loading: false, error: null });
  };

  return {
    projectId: null,
    tasks: [],
    filteredTasks: [],
    sortBy: "startDate",
    filterBy: "",
    loading: false,
    error: null,

    setProjectId: (projectId) => {
      // tear down previous listener
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      set({ projectId, tasks: [], filteredTasks: [] });
      // call fetchTasks() after this to wire up the new listener
    },

    setSortBy: (sortBy) => {
      const tasks = [...get().tasks].sort((a, b) => compareBy(a, b, sortBy));
      set({ sortBy, filteredTasks: tasks });
    },

    setFilter: (filterBy) => {
      const { tasks, sortBy } = get();
      const term = filterBy.toLowerCase();
      const filtered = term
        ? tasks.filter(
            (t) =>
              t.name.toLowerCase().includes(term) ||
              (t.status ?? "").toLowerCase().includes(term)
          )
        : tasks;
      set({
        filterBy,
        filteredTasks: [...filtered].sort((a, b) => compareBy(a, b, sortBy)),
      });
    },

    /**
     * Subscribe to tasks under projects/{projectId}/tasks
     * (matches what your uploader/API writes)
     */
    fetchTasks: () => {
      const projectId = get().projectId;

      if (!projectId) {
        set({
          tasks: [],
          filteredTasks: [],
          loading: false,
          error: null,
        });
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }
        return;
      }

      set({ loading: true, error: null });

      const tasksRef = collection(db, "projects", projectId, "tasks");
      const q = query(tasksRef, orderBy("startDate"));

      if (unsubscribe) unsubscribe();
      unsubscribe = onSnapshot(
        q,
        (snap) => {
          const tasks: Task[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Task, "id">),
          }));
          reapplyFilters(tasks);
        },
        (err) => set({ loading: false, error: err.message })
      );
    },

    /**
     * Client-side add to the subcollection.
     * (Your server-side CSV upload already writes here as well.)
     */
    addTask: async (task) => {
      if (!task.projectId) throw new Error("projectId is required on task");
      const ref = await addDoc(
        collection(db, "projects", task.projectId, "tasks"),
        {
          ...task,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );
      return ref.id;
    },

    addMany: async (tasks) => {
      if (!tasks.length) return;

      // Group by projectId to batch per subcollection
      const groups = new Map<string, Omit<Task, "id">[]>();
      for (const t of tasks) {
        if (!t.projectId) throw new Error("projectId is required on each task");
        const arr = groups.get(t.projectId) || [];
        arr.push(t);
        groups.set(t.projectId, arr);
      }

      for (const [projectId, arr] of groups.entries()) {
        const batch = writeBatch(db);
        for (const t of arr) {
          const ref = doc(collection(db, "projects", projectId, "tasks"));
          batch.set(ref, {
            ...t,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        await batch.commit();
      }
    },

    updateTask: async (taskId, updates) => {
      const projectId = get().projectId;
      if (!projectId) throw new Error("No active project");
      const taskRef = doc(db, "projects", projectId, "tasks", taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    },

    clear: () => {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      set({
        tasks: [],
        filteredTasks: [],
        filterBy: "",
        loading: false,
        error: null,
      });
    },
  };
});