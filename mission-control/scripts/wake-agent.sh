#!/usr/bin/env bash
# Wake an agent via Clawdbot sessions_send
# Usage: ./wake-agent.sh <sessionKey> <message>

SESSION_KEY="$1"
MESSAGE="${2:-Check Mission Control for new @mentions}"

# Extract agent ID from sessionKey (format: agent:name:main)
AGENT_ID=$(echo "$SESSION_KEY" | cut -d: -f2)

# Use Clawdbot's message tool to wake the agent via their session
# This sends a message directly to their session, waking them immediately
curl -X POST \
  -H "Authorization: Bearer ${GATEWAY_TOKEN:-d20dc84d1e244037bed4ab5c0f086cc0e25978249b9b8b43}" \
  -H "Content-Type: application/json" \
  -d "{
    \"action\": \"system_wake\",
    \"sessionKey\": \"$SESSION_KEY\",
    \"text\": \"$MESSAGE\"
  }" \
  "http://localhost:18789/api/sessions/wake" 2>&1

exit_code=$?

if [ $exit_code -eq 0 ]; then
  echo "✓ Woke $AGENT_ID"
else
  echo "✗ Failed to wake $AGENT_ID"
  exit 1
fi
