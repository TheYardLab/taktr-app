import React from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useTasksStore } from "@/components/hooks/useTasksStore";

type Project = { id: string; name: string };

export default function ProjectSelector() {
  const { projectId, setProjectId, fetchTasks } = useTasksStore();

  const [uid, setUid] = React.useState<string | null>(null);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [newName, setNewName] = React.useState("");

  // Track auth state reliably
  React.useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
  }, []);

  // Load the user’s projects when we have a UID
  React.useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "projects"), where(`members.${uid}`, "==", true));
    const unsub = onSnapshot(q, (snap) => {
      const list: Project[] = snap.docs.map((d) => ({
        id: d.id,
        name: (d.data().name as string) || d.id,
      }));
      setProjects(list);

      // If nothing selected yet, pick the first and subscribe
      if (!projectId && list.length) {
        setProjectId(list[0].id);
        fetchTasks();
      }
    });
    return () => unsub();
  }, [uid, projectId, setProjectId, fetchTasks]);

  async function createProject() {
    const name = newName.trim();
    if (!uid || !name) return;

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const ref = doc(collection(db, "projects"), id);

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
    setNewName("");
    fetchTasks();
  }

  const disabled = !uid;

  return (
    <div className="flex items-center gap-2">
      <select
        className="border rounded px-2 py-1"
        value={projectId || ""}
        onChange={(e) => {
          setProjectId(e.target.value || null);
          fetchTasks();
        }}
        disabled={disabled || projects.length === 0}
      >
        <option value="" disabled>
          {disabled ? "Signing in…" : "Select project…"}
        </option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <input
        className="border rounded px-2 py-1"
        placeholder="New project name"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        disabled={disabled}
      />
      <button
        className="px-3 py-1 rounded bg-black text-white disabled:opacity-50"
        onClick={createProject}
        disabled={disabled || !newName.trim()}
      >
        Create
      </button>
    </div>
  );
}