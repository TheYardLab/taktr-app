import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({ error: "Missing taskId" });
    }

    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);

    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({ error: "Failed to delete task" });
  }
}
