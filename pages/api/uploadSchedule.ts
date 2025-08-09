// pages/api/uploadSchedule.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getApps, initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Initialize Admin SDK once (works locally with GOOGLE_APPLICATION_CREDENTIALS or env var FIREBASE_SERVICE_ACCOUNT)
if (!getApps().length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);
      initializeApp({ credential: cert(sa) });
    } else {
      initializeApp({ credential: applicationDefault() });
    }
  } catch {
    // last resort
    initializeApp({ credential: applicationDefault() });
  }
}

const db = getFirestore();

type BodyTask = {
  id?: string;
  name: string;
  status?: "Not Started" | "In Progress" | "Blocked" | "Done";
  startDate: string; // ISO
  endDate: string;   // ISO
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  // Verify Firebase ID token from client
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  if (!token) return res.status(401).send("Missing bearer token");

  let uid: string;
  try {
    const decoded = await getAuth().verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return res.status(401).send("Invalid token");
  }

  const { projectId, tasks } = req.body as { projectId?: string; tasks?: BodyTask[] };
  if (!projectId) return res.status(400).send("projectId is required");
  if (!Array.isArray(tasks) || !tasks.length) return res.status(400).send("tasks[] required");

  try {
    // Ensure project exists and add user as owner/member
    const projectRef = db.collection("projects").doc(projectId);
    await projectRef.set(
      {
        ownerId: uid,
        members: { [uid]: true },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const batch = db.batch();
    const tasksCol = projectRef.collection("tasks");

    for (const t of tasks) {
      const safeName = (t.name || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const dateTag = (t.startDate || "").slice(0, 10) || "na";
      const id = t.id || `${safeName || "task"}-${dateTag}`;
      const ref = tasksCol.doc(id);

      batch.set(
        ref,
        {
          id,
          projectId,
          ownerId: uid,
          name: t.name,
          status: t.status ?? "Not Started",
          startDate: t.startDate,
          endDate: t.endDate,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    await batch.commit();
    return res.status(200).json({ ok: true, count: tasks.length });
  } catch (e: any) {
    console.error("uploadSchedule admin error", e);
    return res.status(500).send(e?.message || "Server error");
  }
}