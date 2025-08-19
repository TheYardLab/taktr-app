// pages/api/devSeed.ts
import type { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebaseAdmin";

type SeedBody = {
  projectId?: string;
  adminEmail?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // simple guard so this isn't public
    const secret = req.query.secret as string;
    if (!secret || secret !== process.env.DEV_SEED_SECRET) {
      return res.status(401).json({ error: "Unauthorized (bad secret)" });
    }

    const { db, auth } = admin;

    const projectId =
      (req.method === "POST" ? (req.body as SeedBody)?.projectId : (req.query.projectId as string))?.trim() ||
      "demo-project";

    const adminEmail =
      (req.method === "POST" ? (req.body as SeedBody)?.adminEmail : (req.query.adminEmail as string))?.trim() ||
      "mfurry@theyardlab.com";

    // ensure admin user exists; get uid
    const user = await auth.getUserByEmail(adminEmail);
    const uid = user.uid;

    const projectRef = db.collection("projects").doc(projectId);

    // project doc (client-readable per your rules)
    await projectRef.set(
      {
        name: "Seeded Demo Project",
        ownerId: uid,
        members: { [uid]: true },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // meta/takt
    const taktRef = projectRef.collection("meta").doc("takt");
    await taktRef.set(
      {
        zones: ["North Wing", "South Wing", "East Wing", "West Wing"],
        trades: ["Concrete", "Framing", "MEP", "Drywall", "Painting"],
        taktTimeDays: 5,
        updatedAt: new Date().toISOString(),
        updatedBy: uid,
      },
      { merge: true }
    );

    // tasks
    const tasksCol = projectRef.collection("tasks");
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = (day: number) => new Date(y, m, day).toISOString();

    const seedTasks = [
      { name: "Excavate footings", zone: "North Wing", trade: "Concrete", status: "done",        startDate: d(1),  endDate: d(3),  plannedHours: 24, actualHours: 20 },
      { name: "Pour footings",     zone: "North Wing", trade: "Concrete", status: "done",        startDate: d(4),  endDate: d(5),  plannedHours: 16, actualHours: 18 },
      { name: "Form walls",        zone: "South Wing", trade: "Concrete", status: "in-progress", startDate: d(6),  endDate: d(8),  plannedHours: 24, actualHours: 10 },
      { name: "Frame level 1",     zone: "South Wing", trade: "Framing",  status: "in-progress", startDate: d(9),  endDate: d(14), plannedHours: 40, actualHours: 12 },
      { name: "MEP rough-in",      zone: "East Wing",  trade: "MEP",      status: "not-started", startDate: d(15), endDate: d(20), plannedHours: 48 },
      { name: "Hang drywall",      zone: "West Wing",  trade: "Drywall",  status: "not-started", startDate: d(21), endDate: d(25), plannedHours: 40 },
      { name: "Prime & paint",     zone: "West Wing",  trade: "Painting", status: "not-started", startDate: d(26), endDate: d(28), plannedHours: 24 },
      { name: "Frame level 2",     zone: "North Wing", trade: "Framing",  status: "not-started", startDate: d(16), endDate: d(22), plannedHours: 56 },
      { name: "MEP inspection",    zone: "East Wing",  trade: "MEP",      status: "not-started", startDate: d(23), endDate: d(23), plannedHours: 8 },
      { name: "Close walls",       zone: "South Wing", trade: "Drywall",  status: "not-started", startDate: d(24), endDate: d(29), plannedHours: 40 }
    ];

    // ✅ Admin SDK batch is on db, not db.firestore
    const batch = db.batch();
    for (const t of seedTasks) {
      const ref = tasksCol.doc();
      batch.set(ref, {
        ...t,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        percentComplete: t.status === "done" ? 100 : t.status === "in-progress" ? 50 : 0,
      });
    }
    await batch.commit();

    return res.status(200).json({ ok: true, projectId, seededTasks: seedTasks.length });
  } catch (e: any) {
    console.error("devSeed error", e);
    return res.status(500).json({ error: e?.message || "server error" });
  }
}