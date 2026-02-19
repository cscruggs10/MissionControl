#!/bin/bash
# Blaster heartbeat - checks Mission Control for assigned content tasks

AGENT_NAME="Blaster"
AGENT_ID="j97563rs79x9wn50ymj9nnvwfd81f2e8"
SESSION_KEY="agent:copywriter:main"
WORKSPACE="/root/clawd/agents/blaster"

cd "$WORKSPACE" || exit 1

# Use Clawdbot to trigger Blaster's heartbeat via the session
clawdbot session send \
  --session="$SESSION_KEY" \
  --message="Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK."

# Log the heartbeat
echo "$(date -u +"%Y-%m-%d %H:%M:%S UTC") - Blaster heartbeat triggered" >> "$WORKSPACE/heartbeat.log"
