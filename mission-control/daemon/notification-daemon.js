#!/usr/bin/env node
/**
 * Notification Daemon
 * 
 * Polls Convex every 2 seconds for undelivered notifications.
 * Delivers them to agents via Clawdbot sessions.send API.
 * NEW: Immediately wakes agents when @mentioned (instant response).
 */

const { ConvexHttpClient } = require("convex/browser");
const fetch = require("node-fetch");

// Configuration
const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:3842";
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN;
const POLL_INTERVAL_MS = 2000;

if (!CONVEX_URL) {
  console.error("❌ CONVEX_URL or NEXT_PUBLIC_CONVEX_URL not set");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Track last notification check to detect NEW mentions
let lastNotificationCount = 0;

async function sendToAgent(sessionKey, message) {
  const url = `${GATEWAY_URL}/api/sessions/send`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(GATEWAY_TOKEN && { Authorization: `Bearer ${GATEWAY_TOKEN}` }),
    },
    body: JSON.stringify({
      sessionKey,
      message,
      timeoutSeconds: 5,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to send: ${response.status} ${text}`);
  }

  return await response.json();
}

async function wakeAgent(sessionKey, agentName, content) {
  /**
   * Immediately wake an agent with the @mention content.
   * This bypasses the heartbeat wait - agent responds NOW.
   */
  try {
    console.log(`🚨 INSTANT WAKE: ${agentName} (${sessionKey})`);
    console.log(`   Content: ${content.substring(0, 100)}...`);
    
    await sendToAgent(sessionKey, content);
    
    console.log(`✓ ${agentName} woken and notified`);
    return true;
  } catch (error) {
    console.log(`⏸  ${agentName} unavailable for instant wake: ${error.message}`);
    return false;
  }
}

async function processNotifications() {
  try {
    // Get undelivered notifications
    const notifications = await client.query("notifications:getUndelivered");

    if (notifications.length === 0) {
      lastNotificationCount = 0;
      return;
    }

    // Detect NEW notifications (instant wake trigger)
    const isNewBatch = notifications.length > lastNotificationCount;
    lastNotificationCount = notifications.length;

    if (isNewBatch) {
      console.log(`📬 ${notifications.length} notification(s) detected (${isNewBatch ? 'NEW - instant wake' : 'retry'})`);
    }

    for (const notification of notifications) {
      if (!notification.sessionKey) {
        console.warn(`⚠️  No sessionKey for agent ${notification.agentName}`);
        continue;
      }

      try {
        // Attempt instant wake if this is a new notification batch
        if (isNewBatch) {
          await wakeAgent(notification.sessionKey, notification.agentName, notification.content);
        } else {
          // Regular delivery (retry from previous failed attempt)
          await sendToAgent(notification.sessionKey, notification.content);
        }
        
        // Mark as delivered
        await client.mutation("notifications:markDelivered", {
          id: notification._id,
        });

        console.log(`✓ Delivered to ${notification.agentName}`);
      } catch (error) {
        // Agent might be asleep - notification stays queued
        if (!isNewBatch) {
          // Only log retries if not first attempt
          console.log(`⏸  ${notification.agentName} unavailable (will retry): ${error.message}`);
        }
      }
    }
  } catch (error) {
    console.error("❌ Error processing notifications:", error);
  }
}

async function main() {
  console.log("🚀 Notification daemon starting...");
  console.log(`   Convex: ${CONVEX_URL}`);
  console.log(`   Gateway: ${GATEWAY_URL}`);
  console.log(`   Poll interval: ${POLL_INTERVAL_MS}ms`);
  console.log(`   Mode: INSTANT WAKE on @mentions`);
  console.log("");

  // Poll loop
  while (true) {
    await processNotifications();
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

// Handle shutdown gracefully
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down notification daemon...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n👋 Shutting down notification daemon...");
  process.exit(0);
});

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
