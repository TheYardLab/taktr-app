// lib/ProjectContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { app } from "@/lib/firebase";
import {
  getAuth,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  serverTimestamp,
  DocumentData,
} from "firebase/firestore";

export type TaskStatus = "Not Started" | "In Progress" | "Blocked" | "Done" | "Completed";

export type Task = {
  id: string;
  projectId: string;
  name: string;
  status?: TaskStatus;
  startDate?: string; // ISO
  endDate?: string;   // ISO
  updatedAt?: string;
};

export type Project = {
  id: string;
  name?: string;
  ownerId?: string;
  members?: Record<string, boolean>;
  createdAt?: string;
  updatedAt?: string;
};

type Ctx = {
  user: FirebaseUser | null;
  ready: boolean; // auth ready
  projects: Project[];
  projectId: string | null;
  setProjectId: (id: string | null) => void;
  createProject: (name: string) => Promise<string>;
  error: string | null;

  // simple “poke” to tell listeners to refetch tasks if needed
  refreshSeq: number;
  refreshTasks: () => void;
};

const ProjectContext = createContext<Ctx | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const auth = useMemo(() => getAuth(app), []);
  const db = useMemo(() => getFirestore(app), []);

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [ready, setReady] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [projectId, _setProjectId] = useState<string | null>(null);
  const [refreshSeq, setRefreshSeq] = useState(0);

  // -------- auth gate ----------
  useEffect(() => {
    const off = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setReady(true);
    });
    return off;
  }, [auth]);

  // -------- restore selected project from localStorage ----------
  useEffect(() => {
    try {
      const saved = localStorage.getItem("taktr.projectId");
      if (saved) _setProjectId(saved);
    } catch {}
  }, []);

  const setProjectId = useCallback((id: string | null) => {
    _setProjectId(id);
    try {
      if (id) localStorage.setItem("taktr.projectId", id);
      else localStorage.removeItem("taktr.projectId");
    } catch {}
  }, []);

  // -------- subscribe to the user's projects (only after auth) ----------
  useEffect(() => {
    if (!ready) return;         // wait for onAuthStateChanged
    if (!user) {
      setProjects([]);
      return;
    }

    setError(null);
    let unsub = () => {};
    try {
      // Firestore rule-friendly query: projects where this uid is a member
      const q = query(
        collection(db, "projects"),
        where(`members.${user.uid}`, "==", true)
      );

      unsub = onSnapshot(
        q,
        (snap) => {
          const list: Project[] = [];
          snap.forEach((doc) => {
            const d = doc.data() as DocumentData;
            list.push({
              id: doc.id,
              name: d.name,
              ownerId: d.ownerId,
              members: d.members,
              createdAt: d.createdAt?.toDate?.()?.toISOString?.() ?? d.createdAt,
              updatedAt: d.updatedAt?.toDate?.()?.toISOString?.() ?? d.updatedAt,
            });
          });
          setProjects(list);

          // if nothing selected, auto-select the first one
          if (!projectId && list.length > 0) {
            setProjectId(list[0].id);
          }
        },
        (err) => {
          console.error("projects snapshot error:", err);
          setError(err?.message || "Failed to load projects");
          setProjects([]);
        }
      );
    } catch (e: any) {
      console.error("projects subscribe error:", e);
      setError(e?.message || "Failed to load projects");
      setProjects([]);
    }
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, ready, user?.uid]);

  // -------- create project helper ----------
  const createProject = useCallback(
    async (name: string) => {
      if (!user) throw new Error("Must be signed in to create a project");
      const docRef = await addDoc(collection(db, "projects"), {
        name: name?.trim() || "Untitled Project",
        ownerId: user.uid,
        members: { [user.uid]: true },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      // set selected project to the one we just made
      setProjectId(docRef.id);
      return docRef.id;
    },
    [db, user, setProjectId]
  );

  // -------- refresh notifier used by UploadSchedule etc. ----------
  const refreshTasks = useCallback(() => setRefreshSeq((n) => n + 1), []);

  const value: Ctx = {
    user,
    ready,
    projects,
    projectId,
    setProjectId,
    createProject,
    error,
    refreshSeq,
    refreshTasks,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjectContext(): Ctx {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useProjectContext must be used within <ProjectProvider>");
  }
  return ctx;
}