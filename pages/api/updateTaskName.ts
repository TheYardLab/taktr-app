// pages/api/updateTaskName.ts
import type { NextApiRequest, NextApiResponse } from "next";
import firebaseAdmin from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const { db } = firebaseAdmin;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { projectId, taskId, name } = req.body ?? {};
    if (!projectId || !taskId || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "projectId, taskId and non-empty name are required" });
    }

    const ref = db
      .collection("projects")
      .doc(projectId)
      .collection("tasks")
      .doc(taskId);

    await ref.update({
      name: name.trim(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("updateTaskName error:", err);
    return res.status(500).json({ error: err?.message || "Internal error" });
  }
}