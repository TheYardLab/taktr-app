import type { NextApiRequest, NextApiResponse } from "next";
import "@/lib/firebaseAdmin"; // initialize Admin app (side effect)
import { getAuth } from "firebase-admin/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Accept either x-admin-api-key or Bearer token
  const headerKey =
    (req.headers["x-admin-api-key"] as string) ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice("Bearer ".length)
      : undefined);

  if (!process.env.ADMIN_API_KEY || headerKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { uid, email } = (req.body || {}) as { uid?: string; email?: string };
  if (!uid && !email) {
    return res.status(400).json({ error: "Provide uid or email" });
  }

  try {
    let targetUid = uid;
    if (!targetUid && email) {
      const user = await getAuth().getUserByEmail(email);
      targetUid = user.uid;
    }
    if (!targetUid) {
      return res.status(404).json({ error: "User not found" });
    }

    await getAuth().setCustomUserClaims(targetUid, { admin: true });
    return res.status(200).json({ ok: true, uid: targetUid });
  } catch (err: any) {
    console.error("makeAdmin error:", err);
    return res.status(500).json({ error: err?.message || "Internal error" });
  }
}