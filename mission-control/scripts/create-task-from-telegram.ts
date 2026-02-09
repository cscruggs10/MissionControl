#!/usr/bin/env node
/**
 * Create a task from a Telegram message
 * 
 * Usage:
 * node create-task-from-telegram.ts "task: research competitor pricing"
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env.local") });
const { ConvexHttpClient } = require("convex/browser");

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ CONVEX_URL or NEXT_PUBLIC_CONVEX_URL not set");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

function parseTaskFromMessage(message: string) {
  const lowerMessage = message.toLowerCase().trim();
  
  // Check for task creation keywords
  const taskPatterns = [
    /^create task:?\s+(.+)/i,
    /^new task:?\s+(.+)/i,
    /^add task:?\s+(.+)/i,
    /^task:?\s+(.+)/i,
  ];

  for (const pattern of taskPatterns) {
    const match = message.match(pattern);
    if (match) {
      const content = match[1].trim();
      
      // Split into title and description if there's a newline or " - "
      let title = content;
      let description = content;
      
      if (content.includes('\n')) {
        const lines = content.split('\n');
        title = lines[0].trim();
        description = lines.slice(1).join('\n').trim() || title;
      } else if (content.includes(' - ')) {
        const parts = content.split(' - ');
        title = parts[0].trim();
        description = parts.slice(1).join(' - ').trim();
      }

      return {
        title,
        description,
        isTask: true,
      };
    }
  }

  return {
    title: '',
    description: '',
    isTask: false,
  };
}

async function createTask(message: string) {
  const parsed = parseTaskFromMessage(message);
  
  if (!parsed.isTask) {
    console.log("❌ Message doesn't look like a task creation command");
    console.log("Try: 'task: your task description'");
    return;
  }

  try {
    const taskId = await client.mutation("tasks:create", {
      title: parsed.title,
      description: parsed.description,
    });

    console.log("✅ Task created!");
    console.log(`   ID: ${taskId}`);
    console.log(`   Title: ${parsed.title}`);
    console.log(`   Status: inbox`);
    console.log("");
    console.log("📋 View in Mission Control: http://localhost:3000");
  } catch (error) {
    console.error("❌ Failed to create task:", error);
    process.exit(1);
  }
}

const message = process.argv.slice(2).join(" ");
if (!message) {
  console.error("Usage: node create-task-from-telegram.ts \"task: your task here\"");
  process.exit(1);
}

createTask(message);
