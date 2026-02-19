#!/usr/bin/env node
/**
 * Wake an agent by sending a system event to their session
 * Usage: node wake-agent.js <sessionKey> <message>
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const sessionKey = process.argv[2];
const message = process.argv[3] || "Check Mission Control for new @mentions";

if (!sessionKey) {
  console.error('Usage: node wake-agent.js <sessionKey> <message>');
  process.exit(1);
}

async function wakeAgent() {
  try {
    // Use clawdbot's built-in capability to send a system event
    // This will wake the agent's session immediately
    const command = `echo '${JSON.stringify({ text: message, sessionKey })}' | clawdbot api cron wake --json`;
    
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr && !stderr.includes('WARN')) {
      console.error('Wake error:', stderr);
      process.exit(1);
    }
    
    console.log('✓ Agent woken');
    process.exit(0);
  } catch (error) {
    console.error('Failed to wake agent:', error.message);
    process.exit(1);
  }
}

wakeAgent();
