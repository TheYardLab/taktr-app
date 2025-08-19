// pages/api/taktMeta.ts
import type { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

type Body = {
  projectId?: string;
  zones?: string[];
  trades?: string[];
};

function allowCors(res: NextApiResponse) {
  // Adjust the origin as needed (use your domain in production)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  allowCors(res);
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const { db, auth } = admin;

  try {
    // --- Verify caller (Bearer <ID_TOKEN>) ---
    const authHeader = req.headers.authorization || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!idToken) {
      return res.status(401).json({ error: "Missing bearer token" });
    }

    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // --- Read projectId from query (GET) or body (POST) ---
    const projectId =
      (req.method === "GET"
        ? (req.query.projectId as string) || ""
        : (req.body as Body)?.projectId || ""
      ).trim();

    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    // --- Ensure the user is a member of the project ---
    const projRef = db.collection("projects").doc(projectId);
    const projSnap = await projRef.get();
    if (!projSnap.exists) {
      return res.status(404).json({ error: "Project not found" });
    }

    const proj = (projSnap.data() as any) || {};
    const isOwner = proj.ownerId === uid;
    const isMember = !!proj.members?.[uid];

    if (!isOwner && !isMember) {
      return res.status(403).json({ error: "Forbidden: not a project member" });
    }

    // --- Meta doc reference ---
    const taktRef = projRef.collection("meta").doc("takt");

    if (req.method === "GET") {
      const snap = await taktRef.get();
      const data = snap.exists ? snap.data() : undefined;

      // Normalize shape
      const zones: string[] = Array.isArray(data?.zones) ? data!.zones : [];
      const trades: string[] = Array.isArray(data?.trades) ? data!.trades : [];

      return res.status(200).json({
        projectId,
        zones,
        trades,
        updatedAt: data?.updatedAt ?? null,
        updatedBy: data?.updatedBy ?? null,
      });
    }

    if (req.method === "POST") {
      const { zones = [], trades = [] } = (req.body as Body) || {};

      // Coerce to unique, trimmed arrays
      const norm = (arr: unknown): string[] =>
        Array.isArray(arr)
          ? Array.from(
              new Set(
                arr
                  .map((x) => (typeof x === "string" ? x.trim() : ""))
                  .filter(Boolean)
              )
            )
          : [];

      const zonesClean = norm(zones);
      const tradesClean = norm(trades);

      await taktRef.set(
        {
          zones: zonesClean,
          trades: tradesClean,
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: uid,
        },
        { merge: true }
      );

      return res.status(200).json({
        ok: true,
        projectId,
        zones: zonesClean,
        trades: tradesClean,
      });
    }

    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    console.error("taktMeta error:", e);
    const msg =
      e?.errorInfo?.message || e?.message || "Server error";
    // 401 for token errors, else 500
    if (msg.toLowerCase().includes("token")) {
      return res.status(401).json({ error: msg });
    }
      return res.status(500).json({ error: msg });
    }
  }