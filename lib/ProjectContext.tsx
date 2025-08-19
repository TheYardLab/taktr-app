
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Timestamp } from "firebase/firestore";
import { onAuthStateChanged, getAuth, User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  Unsubscribe,
  setDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, app } from "@/lib/firebase";

// ---------- Types ----------
export type Task = {
  id: string;
  name: string;
  zone?: string;
  trade?: string;
  status?: string;
  start?: Timestamp | Date | null;
  end?: Timestamp | Date | null;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
  // Allow extra fields without breaking consumers
  [key: string]: any;
};

export type Project = {
  id: string;
  name?: string;
  ownerId?: string;
  members?: Record<string, boolean>;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
  [key: string]: any;
};

// ---------- Context shape ----------
type ProjectContextValue = {
  user: User | null;
  uid: string | null;

  projects: Project[];
  loadingProjects: boolean;
  projectsError: string | null;

  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;

  selectedProject: Project | null;

  projectId: string | null;
  createProject: (name: string) => Promise<string>;
  deleteProject: (id: string) => Promise<void>;
};

// ---------- Context ----------
const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

// ---------- Provider ----------
export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const auth = useMemo(() => getAuth(app), []);
  const [user, setUser] = useState<User | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Watch auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setUid(u?.uid ?? null);
    });
    return () => unsub();
  }, [auth]);

  // Subscribe to user's projects with a server-side filter (no client-side filtering)
  useEffect(() => {
    let unsub: Unsubscribe | undefined;

    async function run() {
      if (!uid) {
        setProjects([]);
        setLoadingProjects(false);
        return;
      }

      try {
        setLoadingProjects(true);
        setProjectsError(null);

        // Query: projects where members.{uid} == true
        const q = query(
          collection(db, "projects"),
          where(`members.${uid}`, "==", true)
        );

        unsub = onSnapshot(
          q,
          (snap) => {
            const list: Project[] = [];
            snap.forEach((docSnap) => list.push({ id: docSnap.id, ...(docSnap.data() as any) }));
            setProjects(list);
            setLoadingProjects(false);

            // If no selection yet, pick the first project (stable UX)
            if (!selectedProjectId && list.length > 0) {
              setSelectedProjectId(list[0].id);
            }
          },
          (err) => {
            console.error("projects snapshot error:", err);
            setProjectsError(err?.message || "Failed to load projects");
            setLoadingProjects(false);
          }
        );
      } catch (e: any) {
        console.error("projects query error:", e);
        setProjectsError(e?.message || "Failed to load projects");
        setLoadingProjects(false);
      }
    }

    run();

    return () => {
      if (unsub) unsub();
    };
  }, [uid, selectedProjectId]);

  // Derive selected project
  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find((p) => p.id === selectedProjectId) ?? null;
  }, [projects, selectedProjectId]);

  const createProject = async (name: string): Promise<string> => {
    if (!uid) throw new Error("Not signed in");
    const projectsCol = collection(db, "projects");
    const docRef = await addDoc(projectsCol, {
      name,
      ownerId: uid,
      members: { [uid]: true },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setSelectedProjectId(docRef.id);
    return docRef.id;
  };

  const deleteProject = async (id: string): Promise<void> => {
    if (!uid) throw new Error("Not signed in");
    const ref = doc(db, "projects", id);
    await deleteDoc(ref);
    if (selectedProjectId === id) {
      setSelectedProjectId(null);
    }
  };

  const value: ProjectContextValue = {
    user,
    uid,
    projects,
    loadingProjects,
    projectsError,
    selectedProjectId,
    setSelectedProjectId,
    selectedProject,
    projectId: selectedProjectId,
    createProject,
    deleteProject,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

// ---------- Hook ----------
export function useProjectContext(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useProjectContext must be used within a ProjectProvider");
  }
  return ctx;
}