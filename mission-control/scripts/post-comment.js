#!/usr/bin/env node
/**
 * Post a comment to a Mission Control task
 * 
 * Usage:
 *   node post-comment.js <taskId> "Your comment text"
 *   node post-comment.js <taskId> "Your comment with @mentions"
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env.local") });
const { ConvexHttpClient } = require("convex/browser");

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ CONVEX_URL or NEXT_PUBLIC_CONVEX_URL not set");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function postComment(taskId, content, fromAgentId = null) {
  try {
    const messageId = await client.mutation("messages:create", {
      taskId,
      content,
      fromAgentId, // null means it's from system/Corey
    });

    console.log("✅ Comment posted!");
    console.log(`   Task: ${taskId}`);
    console.log(`   Content: ${content}`);
    console.log(`   Message ID: ${messageId}`);
    console.log("");
    console.log("📋 View in Mission Control: http://134.199.192.218:3000");
    
    return messageId;
  } catch (error) {
    console.error("❌ Failed to post comment:", error);
    process.exit(1);
  }
}

// Parse command line args
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log("Usage: node post-comment.js <taskId> \"Your comment text\"");
  console.log("");
  console.log("Example:");
  console.log('  node post-comment.js "j12345..." "@jazz Here are the brand assets: [link]"');
  process.exit(1);
}

const [taskId, content] = args;

postComment(taskId, content).then(() => {
  process.exit(0);
});
