#!/usr/bin/env node
/**
 * Daily Standup Generator
 * 
 * Queries Convex for today's agent activity and compiles a summary.
 * Outputs formatted standup report.
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env.local") });
const { ConvexHttpClient } = require("convex/browser");

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ CONVEX_URL or NEXT_PUBLIC_CONVEX_URL not set");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

async function generateStandup() {
  const now = Date.now();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();

  // Get all agents
  const agents = await client.query("agents:list");
  
  // Get today's activities
  const allActivities = await client.query("activities:list", { limit: 1000 });
  const todayActivities = allActivities.filter(a => a.createdAt >= todayStart);

  // Get all tasks
  const allTasks = await client.query("tasks:list");
  
  // Organize by status
  const completed = [];
  const inProgress = [];
  const blocked = [];
  const needsReview = [];
  const decisions = [];

  // Process tasks updated today
  const todayTasks = allTasks.filter(t => t.updatedAt >= todayStart);
  
  for (const task of todayTasks) {
    const assigneeNames = await Promise.all(
      task.assigneeIds.map(async (id) => {
        const agent = agents.find(a => a._id === id);
        return agent?.name || "Unknown";
      })
    );
    
    const assigneeList = assigneeNames.join(", ");
    const taskLine = `${assigneeList}: ${task.title}`;

    if (task.status === "done") {
      completed.push(taskLine);
    } else if (task.status === "blocked") {
      blocked.push(taskLine);
    } else if (task.status === "review") {
      needsReview.push(taskLine);
    } else if (task.status === "in_progress") {
      inProgress.push(taskLine);
    }
  }

  // Look for decision activities (task_created, task_assigned with context)
  const decisionActivities = todayActivities.filter(
    a => a.type === "task_created" || a.type === "task_assigned"
  );
  
  for (const activity of decisionActivities) {
    if (activity.message && !activity.message.startsWith("Task")) {
      decisions.push(activity.message);
    }
  }

  // Build standup report
  const lines = [];
  lines.push(`📊 DAILY STANDUP — ${formatDate(now)}`);
  lines.push("");

  if (completed.length > 0) {
    lines.push("✅ COMPLETED TODAY");
    completed.forEach(item => lines.push(`• ${item}`));
    lines.push("");
  }

  if (inProgress.length > 0) {
    lines.push("🔄 IN PROGRESS");
    inProgress.forEach(item => lines.push(`• ${item}`));
    lines.push("");
  }

  if (blocked.length > 0) {
    lines.push("🚫 BLOCKED");
    blocked.forEach(item => lines.push(`• ${item}`));
    lines.push("");
  }

  if (needsReview.length > 0) {
    lines.push("👀 NEEDS REVIEW");
    needsReview.forEach(item => lines.push(`• ${item}`));
    lines.push("");
  }

  if (decisions.length > 0) {
    lines.push("📝 KEY DECISIONS");
    decisions.slice(0, 5).forEach(item => lines.push(`• ${item}`));
    lines.push("");
  }

  // Agent heartbeat status
  const activeAgents = agents.filter(a => {
    const lastHB = a.lastHeartbeat || 0;
    const hoursSince = (now - lastHB) / (1000 * 60 * 60);
    return hoursSince < 1; // Active in last hour
  });

  if (activeAgents.length > 0) {
    lines.push(`💚 Active Agents: ${activeAgents.map(a => a.name).join(", ")}`);
  }

  const idleAgents = agents.filter(a => {
    const lastHB = a.lastHeartbeat || 0;
    const hoursSince = (now - lastHB) / (1000 * 60 * 60);
    return hoursSince >= 1;
  });

  if (idleAgents.length > 0) {
    lines.push(`😴 Idle Agents: ${idleAgents.map(a => a.name).join(", ")}`);
  }

  const report = lines.join("\n");
  
  // If nothing happened today
  if (completed.length === 0 && inProgress.length === 0 && blocked.length === 0) {
    return `📊 DAILY STANDUP — ${formatDate(now)}\n\n🤷 No significant activity today.\n\nAll agents standing by for assignments.`;
  }

  return report;
}

async function main() {
  try {
    const standup = await generateStandup();
    console.log(standup);
  } catch (error) {
    console.error("❌ Error generating standup:", error);
    process.exit(1);
  }
}

main();
