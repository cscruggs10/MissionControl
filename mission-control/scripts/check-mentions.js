#!/usr/bin/env node
/**
 * Check for @mentions and output wake commands
 * This runs as part of a heartbeat/cron and outputs which agents need waking
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { ConvexHttpClient } = require("convex/browser");

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
const client = new ConvexHttpClient(CONVEX_URL);

async function checkMentions() {
  try {
    const notifications = await client.query("notifications:getUndelivered");
    
    if (notifications.length === 0) {
      console.log("HEARTBEAT_OK");
      return;
    }

    console.log(`🔔 ${notifications.length} undelivered @mention(s):`);
    for (const notif of notifications) {
      console.log(`   • @${notif.agentName}: ${notif.content.substring(0, 60)}...`);
    }
    
    // Output sessionKeys for agents that need waking
    const sessionKeys = notifications
      .filter(n => n.sessionKey)
      .map(n => n.sessionKey)
      .join(',');
    
    if (sessionKeys) {
      console.log(`\nWAKE_NEEDED: ${sessionKeys}`);
    }
  } catch (error) {
    console.error("Error checking mentions:", error);
  }
}

checkMentions();
