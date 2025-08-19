// pages/api/makeAdmin.ts
import type { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebaseAdmin";

/**
 * Minimal admin-maker endpoint for development.
 * Protects with a shared secret to avoid accidental exposure.
 *
 * Usage:
 *   POST /api/makeAdmin
 *   Headers: x-admin-secret: <ADMIN_SECRET>
 *   Body: { "uid": "firebase-uid-to-promote" }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.ADMIN_SECRET;
  const hdr = req.headers["x-admin-secret"];
  if (!secret || hdr !== secret) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const { uid } = (req.body as { uid?: string }) || {};
    if (!uid) return res.status(400).json({ error: "uid is required" });

    // Sanity check that Admin SDK is initialized
    const auth = admin.auth;

    await auth.setCustomUserClaims(uid, { admin: true });
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("makeAdmin error:", e);
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}