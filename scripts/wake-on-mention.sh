#!/bin/bash
# Wake agents when they're @mentioned in Mission Control
# Runs every minute via cron

cd /root/clawd/mission-control

# Check each agent for undelivered notifications
check_agent() {
  AGENT_ID=$1
  SESSION_KEY=$2
  
  # Query Convex for undelivered notifications for this agent
  NOTIF_COUNT=$(npx convex run notifications:list "{\"agentId\": \"$AGENT_ID\", \"undeliveredOnly\": true}" 2>/dev/null | jq 'length' 2>/dev/null || echo "0")
  
  if [ "$NOTIF_COUNT" -gt 0 ] 2>/dev/null; then
    echo "🔔 $SESSION_KEY has $NOTIF_COUNT undelivered notification(s), waking..."
    cd /root/clawd && clawdbot session send \
      --session="$SESSION_KEY" \
      --model="anthropic/claude-haiku-4-5" \
      --message="🔔 You were @mentioned. Read HEARTBEAT.md and check Mission Control for assigned tasks or @mentions." \
      >> /root/clawd/logs/mention-wake.log 2>&1
  fi
}

# Check all active agents
check_agent "j9786pw7xyfe8xx6pb68kaf8ax80w816" "agent:cmp-ajax:main"        # Prowl
check_agent "j975p7jfh4rk3qhx4mkj1ep30n81e0yg" "agent:research:main"       # Soundwave  
check_agent "j97563rs79x9wn50ymj9nnvwfd81f2e8" "agent:copywriter:main"     # Blaster
check_agent "j97176dftr3jkyst67qw1wz33d81fbpw" "agent:skyfire:main"        # Skyfire
