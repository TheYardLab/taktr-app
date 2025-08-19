// pages/api/uploadSchedule.ts
import type { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

type IncomingTask = {
  id?: string;
  name: string;
  status?: "Not Started" | "In Progress" | "Blocked" | "Done" | "Completed";
  startDate: string; // ISO
  endDate: string;   // ISO
  zone?: string | null;
  trade?: string | null;
};

type Body = {
  projectId?: string;
  tasks?: IncomingTask[];
};

function allowCors(res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function normalizeStatus(v?: string): IncomingTask["status"] {
  if (!v) return "Not Started";
  const s = v.toLowerCase();
  if (s.includes("complete")) return "Completed";
  if (s.includes("done")) return "Done";
  if (s.includes("block")) return "Blocked";
  if (s.includes("progress") || s.includes("wip") || s.includes("active")) return "In Progress";
  return "Not Started";
}

function isValidISODate(d?: string) {
  if (!d) return false;
  const t = Date.parse(d);
  return Number.isFinite(t);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  allowCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST", "OPTIONS"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { db, auth } = admin;

  try {
    // Verify caller (Bearer <ID_TOKEN>)
    const authHeader = (req.headers.authorization || "").trim();
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    if (!idToken || idToken === "undefined" || idToken === "null") {
      return res.status(401).json({ error: "Missing bearer token" });
    }

    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Parse body
    const { projectId, tasks = [] } = (req.body as Body) || {};
    if (!projectId || typeof projectId !== "string") {
      return res.status(400).json({ error: "projectId is required" });
    }
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: "tasks array required" });
    }

    // Ensure membership (owner or member). Accept either the map field `members.{uid}`
    // or a subcollection doc at `projects/{projectId}/members/{uid}`.
    const projRef = db.collection("projects").doc(projectId);
    const projSnap = await projRef.get();
    if (!projSnap.exists) return res.status(404).json({ error: "Project not found" });
    const proj = (projSnap.data() as any) || {};
    const isOwner = proj.ownerId === uid;
    const isMemberMap = !!proj.members?.[uid];

    // Check subcollection membership as a fallback for older data models
    let isMemberDoc = false;
    try {
      const memDoc = await projRef.collection("members").doc(uid).get();
      isMemberDoc = memDoc.exists;
    } catch (_) {
      // ignore
    }

    if (!isOwner && !isMemberMap && !isMemberDoc) {
      return res.status(403).json({ error: "Forbidden: not a project member" });
    }

    // Prepare writes
    const col = projRef.collection("tasks");
    const batch = db.batch();

    let validCount = 0;
    for (const raw of tasks) {
      const name = (raw?.name || "").trim();
      const startDate = raw?.startDate;
      const endDate = raw?.endDate;
      if (!name || !isValidISODate(startDate) || !isValidISODate(endDate)) continue;

      const id = (raw.id || col.doc().id).toString();
      const ref = col.doc(id);

      batch.set(
        ref,
        {
          id,
          projectId,
          name,
          status: normalizeStatus(raw.status),
          startDate,
          endDate,
          zone: (raw.zone ?? null) || null,
          trade: (raw.trade ?? null) || null,
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: uid,
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      validCount++;
    }

    if (validCount === 0) return res.status(400).json({ error: "No valid tasks to upload" });

    // Touch project.updatedAt
    batch.set(projRef, { updatedAt: FieldValue.serverTimestamp() }, { merge: true });

    await batch.commit();
    return res.status(200).json({ ok: true, count: validCount });
  } catch (e: any) {
    console.error("uploadSchedule error:", e);
    const msg = e?.errorInfo?.message || e?.message || "Server error";
    if (msg.toLowerCase().includes("token")) {
      return res.status(401).json({ error: msg });
    }
    return res.status(500).json({ error: msg });
  }
}