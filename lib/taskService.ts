import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export async function getTasks() {
  const tasksCol = collection(db, "tasks");
  const snapshot = await getDocs(tasksCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}