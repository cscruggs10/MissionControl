#!/usr/bin/env node
/**
 * Notification Daemon
 * 
 * Polls Convex every 2 seconds for undelivered notifications.
 * Delivers them to agents via Clawdbot sessions.send API.
 * NEW: Immediately wakes agents when @mentioned (instant response).
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

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

async function sendWakeEvent(sessionKey) {
  /**
   * Send wake event via Clawdbot's cron API
   * This triggers an immediate heartbeat check for the agent
   */
  const url = `${GATEWAY_URL}/api/cron/wake`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(GATEWAY_TOKEN && { Authorization: `Bearer ${GATEWAY_TOKEN}` }),
    },
    body: JSON.stringify({
      text: `Check Mission Control for new @mentions`,
      sessionKey,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to wake: ${response.status} ${text}`);
  }

  return await response.json();
}

async function wakeAgent(sessionKey, agentName, content) {
  /**
   * Immediately wake an agent with a wake event.
   * Agent will check Mission Control and see the new @mention.
   */
  try {
    console.log(`🚨 INSTANT WAKE: ${agentName} (${sessionKey})`);
    console.log(`   Mention: ${content.substring(0, 80)}...`);
    
    await sendWakeEvent(sessionKey);
    
    console.log(`✓ ${agentName} wake event sent`);
    return true;
  } catch (error) {
    console.log(`⏸  ${agentName} wake failed: ${error.message}`);
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
          const woken = await wakeAgent(notification.sessionKey, notification.agentName, notification.content);
          if (woken) {
            // Agent woken - they'll pick up notification from Convex on their next heartbeat check
            // Don't mark as delivered yet - let agent mark it when they actually read it
            console.log(`⚡ Wake sent to ${notification.agentName}`);
          }
        }
        
        // Don't auto-mark as delivered - let agents mark notifications as read
        // This way notifications persist until agent actually processes them
      } catch (error) {
        // Agent might be asleep - notification stays queued for next heartbeat
        console.log(`⏸  ${notification.agentName} wake attempt failed: ${error.message}`);
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
