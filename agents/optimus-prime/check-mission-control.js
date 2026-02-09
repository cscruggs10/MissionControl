#!/usr/bin/env node
/**
 * Optimus Prime - Mission Control Check
 * Checks Convex for assigned tasks and takes action
 */

const { ConvexHttpClient } = require("convex/browser");

const CONVEX_URL = process.env.CONVEX_URL || "https://kindly-hyena-65.convex.cloud";
const AGENT_ID = "j978rk5zw2tv9m7ev4bmx9b9k980vge3"; // Optimus Prime's ID

async function main() {
  const client = new ConvexHttpClient(CONVEX_URL);

  // Get all tasks
  const tasks = await client.query("tasks:list", {});

  // 1. FIRST: Check inbox for new tasks to delegate
  const inboxTasks = tasks.filter((task) => task.status === "inbox");
  
  for (const task of inboxTasks) {
    console.log(`📥 INBOX: ${task.title}`);
    
    // Analyze and delegate
    // TODO: When specialists exist, use keywords to assign:
    //   - "LinkedIn", "social" → Amplify
    //   - "research", "data" → Scout
    //   - Complex tasks → Multiple agents
    // For now: assign to myself since I'm solo
    
    const assignees = [AGENT_ID]; // Just me for now
    
    await client.mutation("tasks:assign", {
      id: task._id,
      agentIds: assignees,
    });

    await client.mutation("messages:create", {
      taskId: task._id,
      fromAgentId: AGENT_ID,
      content: "🎯 Task received and assigned. Taking ownership. Will report progress.",
    });

    console.log("✅ Task delegated, moved from inbox → assigned");
  }

  // 2. SECOND: Work on tasks assigned to me
  const myTasks = tasks.filter((task) =>
    task.assigneeIds.includes(AGENT_ID)
  );

  if (myTasks.length === 0 && inboxTasks.length === 0) {
    console.log("HEARTBEAT_OK - No inbox items, no assigned tasks");
    return;
  }

  // Process each task (skip ones we just moved from inbox)
  for (const task of myTasks) {
    // Skip inbox tasks (we just processed them above)
    if (task.status === "inbox") continue;
    
    if (task.status === "assigned" || task.status === "in_progress") {
      console.log(`📋 Task: ${task.title}`);
      console.log(`   Description: ${task.description}`);

      // For test tasks, just respond
      if (task.title.includes("Test:") || task.title.includes("Report")) {
        await client.mutation("messages:create", {
          taskId: task._id,
          fromAgentId: AGENT_ID,
          content: "🤖 Optimus Prime online. Systems operational. Mission Control connection confirmed.",
        });

        await client.mutation("tasks:updateStatus", {
          id: task._id,
          status: "review",
        });

        console.log("✅ Test task completed, moved to review");
      } else {
        // For real tasks, just acknowledge
        await client.mutation("messages:create", {
          taskId: task._id,
          fromAgentId: AGENT_ID,
          content: "Task acknowledged. Analyzing requirements...",
        });

        await client.mutation("tasks:updateStatus", {
          id: task._id,
          status: "in_progress",
        });

        console.log("📝 Task acknowledged, status updated to in_progress");
      }
    }
  }
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});
