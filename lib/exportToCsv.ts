export function exportToCsv(tasks: any[]) {
  const headers = [
    "Task Name",
    "Start Date",
    "End Date",
    "Duration",
    "Dependencies",
    "Assigned To"
  ];

  const formatValue = (value: any) => {
    if (value == null) return "";
    if (value instanceof Date) return value.toISOString().split("T")[0];
    const str = value.toString().replace(/"/g, '""'); // Escape quotes
    return `"${str}"`; // Wrap in quotes to handle commas
  };

  const rows = tasks.map(task => [
    formatValue(task.name),
    formatValue(task.startDate),
    formatValue(task.endDate),
    formatValue(task.duration),
    formatValue(task.dependencies),
    formatValue(task.assignedTo)
  ]);

  // Add UTF-8 BOM for Excel compatibility
  const bom = "\uFEFF";

  // Auto-size columns hint: pad each cell to length of the longest header/task value
  const maxLengths = headers.map((header, colIndex) => {
    return Math.max(
      header.length,
      ...rows.map(row => (row[colIndex] ? row[colIndex].length : 0))
    );
  });

  const paddedHeaders = headers.map((header, i) => header.padEnd(maxLengths[i], " "));
  const paddedRows = rows.map(row => row.map((cell, i) => (cell ?? "").padEnd(maxLengths[i], " ")));

  const csvContent = [paddedHeaders, ...paddedRows]
    .map(e => e.join(","))
    .join("\n");

  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "TaktPlan.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}