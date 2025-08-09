// lib/mppParser.ts

export type MPPTask = {
  id: string;
  name: string;
  start: Date;
  end: Date;
  duration?: string;
  assignedTo?: string;
  status?: string;
  percentComplete?: number;
  milestone?: boolean;
  notes?: string;
  predecessors?: string;
  resources?: string;
};

function safeParseDate(value?: string): Date {
  const parsed = value ? new Date(value) : new Date();
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function parseCSV(content: string): MPPTask[] {
  const lines = content.split("\n").filter(l => l.trim().length > 0);

  // Normalize headers to handle variations like "Task Name", "Start Date", etc.
  const headers = lines[0]
    .split(",")
    .map(h =>
      h
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/name|taskname|title/, "name")
        .replace(/start|startdate|begindate/, "start")
        .replace(/end|finish|finishdate/, "end")
        .replace(/percentcomplete|%complete/, "percentcomplete")
        .replace(/milestone/, "milestone")
        .replace(/notes?/, "notes")
        .replace(/predecessors?/, "predecessors")
        .replace(/resources?/, "resources")
    );

  return lines.slice(1).map(line => {
    const cols = line.split(",");
    const task: any = {};
    headers.forEach((header, i) => {
      task[header] = cols[i]?.trim();
    });
    return {
      id: crypto.randomUUID(),
      name: task.name || task.task || "Unnamed Task",
      start: safeParseDate(task.start || task.startdate),
      end: safeParseDate(task.end || task.finish || task.finishdate),
      duration: task.duration || "",
      assignedTo: task.assignedto || task.resource || "",
      status: task.status || "Pending",
      percentComplete: parseFloat((task.percentcomplete || "0").replace("%", "")) || 0,
      milestone: task.milestone?.toLowerCase() === "true",
      notes: task.notes || "",
      predecessors: task.predecessors || "",
      resources: task.resources || "",
    };
  });
}

function parseXML(content: string): MPPTask[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(content, "application/xml");
  const tasks: MPPTask[] = [];
  const taskNodes = Array.from(xmlDoc.getElementsByTagName("Task"));

  taskNodes.forEach(node => {
    // Normalize XML tags to handle alternate naming
    const nameNode = node.getElementsByTagName("Name")[0] 
      || node.getElementsByTagName("TaskName")[0] 
      || node.getElementsByTagName("Title")[0];
    const startNode = node.getElementsByTagName("Start")[0] 
      || node.getElementsByTagName("StartDate")[0] 
      || node.getElementsByTagName("Begin")[0];
    const finishNode = node.getElementsByTagName("Finish")[0] 
      || node.getElementsByTagName("FinishDate")[0] 
      || node.getElementsByTagName("End")[0];
    const percentCompleteNode = node.getElementsByTagName("PercentComplete")[0]
      || node.getElementsByTagName("%Complete")[0];
    const milestoneNode = node.getElementsByTagName("Milestone")[0];

    const name = nameNode?.textContent?.trim() || "Unnamed Task";
    const start = safeParseDate(startNode?.textContent?.trim());
    const finish = safeParseDate(finishNode?.textContent?.trim());
    const percentCompleteRaw = percentCompleteNode?.textContent?.trim() || "";
    const percentComplete = percentCompleteRaw.endsWith("%")
      ? parseFloat(percentCompleteRaw.replace("%", "")) || 0
      : parseFloat(percentCompleteRaw) || 0;
    const milestone = milestoneNode?.textContent?.trim().toLowerCase() === "true";

    const notesNode = node.getElementsByTagName("Notes")[0];
    const predecessorsNode = node.getElementsByTagName("Predecessors")[0];
    const resourcesNode = node.getElementsByTagName("Resources")[0];

    tasks.push({
      id: crypto.randomUUID(),
      name,
      start,
      end: finish,
      duration: "",
      assignedTo: "",
      status: "Pending",
      percentComplete,
      milestone,
      notes: notesNode?.textContent?.trim() || "",
      predecessors: predecessorsNode?.textContent?.trim() || "",
      resources: resourcesNode?.textContent?.trim() || "",
    });
  });

  return tasks;
}

export async function parseMPP(file: File): Promise<MPPTask[]> {
  try {
    const content = await file.text();
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".csv")) {
      return parseCSV(content);
    } else if (fileName.endsWith(".xml")) {
      return parseXML(content);
    } else {
      throw new Error("Unsupported file format. Please upload a CSV or XML exported from MS Project.");
    }
  } catch (error) {
    throw new Error("Failed to parse MPP/CSV/XML file: " + (error as Error).message);
  }
}