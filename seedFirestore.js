// seedFirestore.js
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = require("./serviceAccountKey.json"); // your Firebase admin key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore();

// Helper: generate evenly spaced dates over 6 months
function generateDates(startDate, taskCount) {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(start);
  end.setMonth(start.getMonth() + 6);

  const step = (end.getTime() - start.getTime()) / taskCount;

  for (let i = 0; i < taskCount; i++) {
    const date = new Date(start.getTime() + step * i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
}

// Example Phases and Trades
const phases = [
  { phase: "Mobilization", trades: ["Site Prep", "Surveying"] },
  { phase: "Foundation", trades: ["Concrete", "Formwork"] },
  { phase: "Structure", trades: ["Steel Erection", "Framing"] },
  { phase: "MEP Rough-In", trades: ["Electrical", "Plumbing", "HVAC"] },
  { phase: "Finishes", trades: ["Drywall", "Painting", "Flooring"] },
  { phase: "Closeout", trades: ["Punch List", "Commissioning"] },
];

// Function to generate tasks
function generateTasks(startDate) {
  const taskCount = phases.reduce((acc, p) => acc + p.trades.length, 0);
  const dates = generateDates(startDate, taskCount);

  let tasks = [];
  let dateIndex = 0;

  phases.forEach((phase) => {
    phase.trades.forEach((trade) => {
      tasks.push({
        id: `${phase.phase}-${trade}`.replace(/\s+/g, "-").toLowerCase(),
        name: `${phase.phase} - ${trade}`,
        status: "Not Started",
        type: phase.phase,
        description: `${trade} work during ${phase.phase}`,
        plannedStart: dates[dateIndex],
        plannedEnd: dates[dateIndex + 1] || dates[dateIndex],
      });
      dateIndex++;
    });
  });

  return tasks;
}

// Generate random metrics
function generateMetrics() {
  return [
    { name: "Planned Progress", value: `${Math.floor(Math.random() * 100)}%` },
    { name: "Actual Progress", value: `${Math.floor(Math.random() * 100)}%` },
    { name: "Schedule Variance", value: `${Math.floor(Math.random() * 20) - 10}%` },
  ];
}

// Seed Projects
async function seed() {
  const projects = [
    { name: "Project Alpha", startDate: "2025-08-05" },
    { name: "Project Beta", startDate: "2025-09-01" },
    { name: "Project Gamma", startDate: "2025-10-01" },
  ];

  for (const project of projects) {
    const projectRef = db.collection("projects").doc();
    await projectRef.set({
      name: project.name,
      startDate: project.startDate,
    });

    // Add tasks subcollection
    const tasks = generateTasks(project.startDate);
    for (const task of tasks) {
      await projectRef.collection("tasks").add(task);
    }

    // Add metrics subcollection
    const metrics = generateMetrics();
    for (const metric of metrics) {
      await projectRef.collection("metrics").add(metric);
    }

    console.log(`✅ Seeded ${project.name}`);
  }
  console.log("🎉 All projects seeded successfully!");
}

seed();