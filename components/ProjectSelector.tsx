// components/ProjectSelector.tsx
"use client";

import React from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
  Unsubscribe,
  Timestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/lib/firebase";
import { useTasksStore } from "@/components/hooks/useTasksStore";

type Project = {
  id: string;
  name: string;
  updatedAt?: Timestamp | { seconds?: number } | null;
};

export default function ProjectSelector() {
  const auth = getAuth();

  // store
  const projectId     = useTasksStore((s) => s.projectId);
  const setProjectId  = useTasksStore((s) => s.setProjectId);
  const defaultSetProjectMeta = React.useCallback((_: any, __: any) => {}, []);
  const setProjectMeta = React.useMemo(
    () => useTasksStore.getState().setProjectMeta ?? defaultSetProjectMeta,
    [defaultSetProjectMeta]
  );
  const fetchTasks    = useTasksStore((s) => s.fetchTasks);

  const [uid, setUid] = React.useState<string | null>(auth.currentUser?.uid ?? null);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [newName, setNewName] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  // watch auth
  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => unsub();
  }, [auth]);

  // subscribe to projects, filter by owner/member
  React.useEffect(() => {
    // Use *server-side filtered* queries to satisfy Firestore rules and avoid
    // permission errors from trying to read projects the user can't access.
    let unsubOwner: Unsubscribe | null = null;
    let unsubMember: Unsubscribe | null = null;

    if (!uid) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErr(null);

    const colRef = collection(db, "projects");

    // 1) Projects where the user is the owner
    const qOwner = query(colRef, where("ownerId", "==", uid));
    unsubOwner = onSnapshot(
      qOwner,
      (snap) => {
        const owned: Project[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          owned.push({
            id: d.id,
            name: data.name ?? d.id,
            updatedAt: data.updatedAt ?? null,
          });
        });

        // 2) Projects where the user is a member (members.<uid> == true)
        const qMember = query(colRef, where(`members.${uid}`, "==", true));
        unsubMember = onSnapshot(
          qMember,
          (snapM) => {
            const member: Project[] = [];
            snapM.forEach((d) => {
              const data = d.data() as any;
              member.push({
                id: d.id,
                name: data.name ?? d.id,
                updatedAt: data.updatedAt ?? null,
              });
            });

            // Merge (owner ∪ member) de-duplicated
            const dedupMap = new Map<string, Project>();
            [...owned, ...member].forEach((p) => dedupMap.set(p.id, p));
            const merged = Array.from(dedupMap.values());

            // sort: most recent updated first, then name
            merged.sort((a, b) => {
              const at =
                (a.updatedAt as any)?.toMillis?.() ??
                ((a.updatedAt as any)?.seconds ? (a.updatedAt as any).seconds * 1000 : 0);
              const bt =
                (b.updatedAt as any)?.toMillis?.() ??
                ((b.updatedAt as any)?.seconds ? (b.updatedAt as any).seconds * 1000 : 0);
              if (bt !== at) return bt - at;
              return (a.name || a.id).localeCompare(b.name || b.id);
            });

            setProjects(merged);

            // set default project if none selected
            if (!projectId && merged.length) {
              const first = merged[0];
              setProjectId(first.id);
              setProjectMeta(first.id, first.name);
              fetchTasks?.();
            }

            setLoading(false);
          },
          (e) => {
            setErr(e.message);
            setLoading(false);
          }
        );
      },
      (e) => {
        setErr(e.message);
        setLoading(false);
      }
    );

    return () => {
      unsubOwner?.();
      unsubMember?.();
    };
  }, [uid, projectId, setProjectId, fetchTasks, setProjectMeta]);

  async function createProject() {
    if (!uid) return;
    const name = newName.trim();
    if (!name) return;

    const id = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const ref = doc(db, "projects", id);
    await setDoc(
      ref,
      {
        name,
        ownerId: uid,
        members: { [uid]: true },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    setProjectId(id);
    setProjectMeta(id, name);
    setNewName("");
    fetchTasks?.();
  }

  return (
    <div className="flex items-center gap-2">
      <select
        className="border rounded px-2 py-1 min-w-[220px]"
        value={projectId || ""}
        onChange={(e) => {
          const pid = e.target.value || null;
          setProjectId(pid);
          const meta = projects.find((p) => p.id === pid);
          setProjectMeta(pid, meta?.name ?? null);
          fetchTasks?.();
        }}
        disabled={!uid || loading}
      >
        {!uid && <option value="">Sign in to see projects</option>}
        {uid && loading && <option value="">Loading…</option>}
        {uid && !loading && projects.length === 0 && <option value="">No projects found</option>}
        {uid &&
          !loading &&
          projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name || p.id}
            </option>
          ))}
      </select>

      <input
        className="border rounded px-2 py-1"
        placeholder="New project name"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
      />
      <button
        className="px-3 py-1 rounded bg-black text-white disabled:opacity-50"
        onClick={createProject}
        disabled={!uid || !newName.trim()}
      >
        Create
      </button>

      {err && <div className="ml-2 text-xs text-red-600">Error: {err}</div>}
    </div>
  );
}