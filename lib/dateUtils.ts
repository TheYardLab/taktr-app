// 🔹 Convert various date formats into Date objects safely
export function parseDate(dateValue: string | Date | undefined): Date {
  if (!dateValue) return new Date(); // Default to today if missing
  if (dateValue instanceof Date) return dateValue; // Already a Date
  return new Date(dateValue); // Convert string
}

// 🔹 Calculate difference in days between two dates
export function dateToDayIndex(start: Date, end: Date): number {
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}