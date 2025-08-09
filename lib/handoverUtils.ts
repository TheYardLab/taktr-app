import { Task, Handover } from "./ProjectContext";

export function generateHandoverReport(handovers: Handover[]) {
  return handovers
    .map((h) => `${h.name || "Unnamed Handover"} - ${h.description || "No description"}: ${h.status || "Pending"}`)
    .join("\n");
}

export function getHandovers(tasks: Task[]): Handover[] {
  // Ensure mapping is type-safe and matches Handover structure
  return tasks
    .filter((t: Task) => 
      (t as any)?.type === "handover" || (t.status?.toLowerCase?.() === "handover")
    )
    .map((t: Task) => ({
      id: (t as any).id || crypto.randomUUID(),
      name: (t as any).name || "Unnamed Handover",
      description: (t as any).description || "No description provided",
      status: t.status || "Pending",
      assignedTo: (t as any).assignedTo || "Unassigned",
      dueDate: (t as any).dueDate || null,
      date: (t as any).date || null
    }));
}