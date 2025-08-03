export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

export function dateToDayIndex(startDate: Date, date: Date): number {
  const diff = date.getTime() - startDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)); // days difference
}