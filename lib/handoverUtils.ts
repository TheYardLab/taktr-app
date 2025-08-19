// lib/handoverUtils.ts
// Utilities for simple "handover" (handoff/dependency) records between tasks.

import type { Task } from "@/components/hooks/useTasksStore";

/**
 * Minimal handover record connecting two tasks.
 * - fromTaskId hands over to toTaskId (i.e., toTask depends on fromTask)
 */
export type Handover = {
  fromTaskId: string;
  toTaskId: string;
  /** Optional ISO date (YYYY-MM-DD) representing the intended handover date */
  date?: string;
  /** Optional free-form notes */
  notes?: string;
};

/**
 * Generate a human-readable text report for a list of handovers.
 * Looks up task names by id; falls back to the raw id if not found.
 */
export function generateHandoverReport(handovers: Handover[], tasks: Task[]): string {
  const byId = new Map<string, Task>(tasks.map((t) => [t.id, t]));
  return handovers
    .map((h, i) => {
      const from = byId.get(h.fromTaskId)?.name ?? h.fromTaskId;
      const to = byId.get(h.toTaskId)?.name ?? h.toTaskId;
      const date = h.date ? ` (${h.date})` : "";
      const notes = h.notes ? ` — ${h.notes}` : "";
      return `${i + 1}. ${from} → ${to}${date}${notes}`;
    })
    .join("\n");
}

/**
 * Return handovers related to a specific task id (either incoming or outgoing).
 */
export function handoversForTask(handovers: Handover[], taskId: string) {
  const incoming = handovers.filter((h) => h.toTaskId === taskId);
  const outgoing = handovers.filter((h) => h.fromTaskId === taskId);
  return { incoming, outgoing };
}

/**
 * Remove exact duplicates (same from/to/date/notes).
 */
export function dedupeHandovers(handovers: Handover[]): Handover[] {
  const seen = new Set<string>();
  const out: Handover[] = [];
  for (const h of handovers) {
    const key = JSON.stringify([h.fromTaskId, h.toTaskId, h.date ?? "", h.notes ?? ""]);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(h);
    }
  }
  return out;
}

/**
 * Validate handovers against the current tasks list.
 * - Ensures task ids exist
 * - Optionally warns if the "from" task ends after the "to" task starts
 *   (only if both dates are present)
 */
export function validateHandovers(handovers: Handover[], tasks: Task[]) {
  const byId = new Map<string, Task>(tasks.map((t) => [t.id, t]));
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [idx, h] of handovers.entries()) {
    if (!byId.has(h.fromTaskId)) {
      errors.push(`Handover #${idx + 1}: unknown fromTaskId "${h.fromTaskId}"`);
    }
    if (!byId.has(h.toTaskId)) {
      errors.push(`Handover #${idx + 1}: unknown toTaskId "${h.toTaskId}"`);
    }

    const from = byId.get(h.fromTaskId);
    const to = byId.get(h.toTaskId);

    if (from?.endDate && to?.startDate) {
      const fromEnd = new Date(from.endDate);
      const toStart = new Date(to.startDate);
      if (!Number.isNaN(fromEnd.getTime()) && !Number.isNaN(toStart.getTime())) {
        if (fromEnd.getTime() > toStart.getTime()) {
          warnings.push(
            `Handover #${idx + 1}: "${from?.name ?? h.fromTaskId}" ends after "${to?.name ?? h.toTaskId}" starts.`
          );
        }
      }
    }
  }

  return { errors, warnings };
}

/**
 * Convenience helper: create a basic handover between two task ids.
 */
export function createHandover(fromTaskId: string, toTaskId: string, opts?: Partial<Handover>): Handover {
  return {
    fromTaskId,
    toTaskId,
    date: opts?.date,
    notes: opts?.notes,
  };
}