import { db } from "./firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

/**
 * Fetch tasks for a given project
 */
export async function getTasks(projectId: string) {
  try {
    const q = query(collection(db, "tasks"), where("projectId", "==", projectId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
}

/**
 * Fetch metrics for a given project
 */
export async function getMetrics(projectId: string) {
  try {
    const q = query(collection(db, "metrics"), where("projectId", "==", projectId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching metrics:", error);
    throw error;
  }
}

/**
 * Fetch handovers for a given project
 */
export async function getHandovers(projectId: string) {
  try {
    const q = query(collection(db, "handovers"), where("projectId", "==", projectId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching handovers:", error);
    throw error;
  }
}
