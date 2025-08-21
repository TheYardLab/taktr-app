import type { NextApiRequest, NextApiResponse } from "next";
import { initializeApp, getApps, getApp, cert, applicationDefault, App } from "firebase-admin/app";
import { getFirestore, Firestore, WriteBatch } from "firebase-admin/firestore";

// --- Firebase Admin init (server-side only) ---
let app: App;
if (getApps().length) {
  app = getApp();
} else {
    // Prefer inline JSON if provided; otherwise fall back to ADC (GOOGLE_APPLICATION_CREDENTIALS path)
    const inline = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    const projectId = process.env.FIREBASE_PROJECT_ID || undefined;
    app = initializeApp(
      inline
        ? { credential: cert(JSON.parse(inline!)), projectId }
        : { credential: applicationDefault(), projectId }
    );
}

const db: Firestore = getFirestore(app);

// --- Types for request payload ---
// Adjust the Task type to fit your schema. Unknown fields are allowed and passed through as-is.
export type Task = Record<string, any> & {
  // Example core fields (optional):
  name?: string;
  startDate?: string; // ISO date
  endDate?: string;   // ISO date
};

export type UploadScheduleRequestBody = {
  projectId: string;
  tasks: Task[]; // array of task-like objects parsed on the client (e.g. from CSV rows)
};

export type UploadScheduleResponse =
  | { ok: true; count: number }
  | { ok: false; error: string };

// --- API Route ---
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadScheduleResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const { projectId, tasks } = req.body as UploadScheduleRequestBody;

    if (!projectId || typeof projectId !== "string") {
      return res.status(400).json({ ok: false, error: "Missing or invalid projectId" });
    }

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ ok: false, error: "Missing or invalid tasks[] array" });
    }

    // Write in a batch under projects/{projectId}/tasks
    const batch: WriteBatch = db.batch();
    const tasksCol = db.collection("projects").doc(projectId).collection("tasks");

    for (const t of tasks) {
      const ref = tasksCol.doc();
      // You can transform/validate each task here if needed
      batch.set(ref, {
        ...t,
        _uploadedAt: new Date().toISOString(),
      });
    }

    await batch.commit();

    return res.status(200).json({ ok: true, count: tasks.length });
  } catch (err: any) {
    const message = typeof err?.message === "string" ? err.message : "Internal Error";
    return res.status(500).json({ ok: false, error: message });
  }
}