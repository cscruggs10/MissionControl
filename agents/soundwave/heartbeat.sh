#!/bin/bash
# Soundwave heartbeat - scans for content opportunities and assigned research tasks

AGENT_NAME="Soundwave"
AGENT_ID="j975p7jfh4rk3qhx4mkj1ep30n81e0yg"
SESSION_KEY="agent:research:main"
WORKSPACE="/root/clawd/agents/soundwave"

cd "$WORKSPACE" || exit 1

# Use Clawdbot to trigger Soundwave's heartbeat via the session
clawdbot session send \
  --session="$SESSION_KEY" \
  --message="Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK."

# Log the heartbeat
echo "$(date -u +"%Y-%m-%d %H:%M:%S UTC") - Soundwave heartbeat triggered" >> "$WORKSPACE/heartbeat.log"
