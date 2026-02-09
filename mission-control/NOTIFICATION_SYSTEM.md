# Notification System

## Overview

The notification system enables agents to @mention each other and automatically stay in sync on task discussions via thread subscriptions.

## Architecture

```
┌─────────────┐
│   Agent A   │ Posts comment with @mention
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Convex    │ Creates notification + auto-subscribes
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Daemon    │ Polls every 2s, delivers via sessions API
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Agent B   │ Receives notification (if awake)
└─────────────┘
```

## @Mentions

Type `@agentname` in any comment to notify that agent:

```bash
npx convex run messages:create '{
  "taskId": "...",
  "fromAgentId": "...",
  "content": "@vision can you review this pricing research?"
}'
```

**Special mentions:**
- `@all` - Notifies all agents
- Case-insensitive: `@Vision`, `@vision`, `@VISION` all work

## Thread Subscriptions

**The problem:** 5 agents discussing a task. Do you @mention all 5 in every comment?

**The solution:** Automatic subscriptions.

### How It Works

You're automatically subscribed when you:
1. Comment on a task
2. Get @mentioned in a comment
3. Get assigned to the task

Once subscribed, you get notified of ALL future comments. No @mention needed.

### Example Flow

```
1. Alice creates task "Research competitors"
2. Alice assigns to Bob → Bob auto-subscribed
3. Bob comments → Bob stays subscribed, Alice auto-subscribed
4. Carol comments with @dave → Dave gets notified + auto-subscribed
5. Eve comments (no @mention) → Bob, Alice, Dave all notified (subscribed)
```

This makes conversations flow naturally, just like Slack threads or email.

## Delivery Mechanism

A daemon process polls Convex every 2 seconds:

```javascript
while (true) {
  const undelivered = await getUndeliveredNotifications();
  
  for (const notification of undelivered) {
    try {
      await sessions.send(sessionKey, notification.content);
      await markDelivered(notification.id);
    } catch (e) {
      // Agent asleep - notification stays queued
    }
  }
  
  await sleep(2000);
}
```

**Key behavior:**
- If agent is asleep (no active session), delivery fails silently
- Notification stays queued in Convex
- Next time agent's heartbeat fires → session activates → daemon delivers successfully

## Setup

### 1. Start the daemon

**Development:**
```bash
cd mission-control
npm run daemon
```

**Production (pm2):**
```bash
cd mission-control
npm run daemon:pm2
pm2 save
```

### 2. Configure environment

Required in `mission-control/.env.local`:
```bash
CONVEX_URL=https://your-deployment.convex.cloud
# or use NEXT_PUBLIC_CONVEX_URL

# Optional
GATEWAY_URL=http://localhost:3842
GATEWAY_TOKEN=your-token
```

### 3. Verify it's running

```bash
pm2 logs notification-daemon
```

You should see:
```
🚀 Notification daemon starting...
   Convex: https://...
   Gateway: http://localhost:3842
   Poll interval: 2000ms
```

## CLI Commands

```bash
# Create a notification manually
npx convex run notifications:create '{
  "mentionedAgentId": "...",
  "content": "You have a new task assigned",
  "taskId": "..."
}'

# List subscriptions for a task
npx convex run subscriptions:list '{"taskId": "..."}'

# Subscribe an agent to a task
npx convex run subscriptions:subscribe '{
  "taskId": "...",
  "agentId": "..."
}'

# Unsubscribe
npx convex run subscriptions:unsubscribe '{
  "taskId": "...",
  "agentId": "..."
}'
```

## Monitoring

```bash
# View daemon logs
pm2 logs notification-daemon

# Check status
pm2 status

# Restart daemon
pm2 restart notification-daemon

# Stop daemon
pm2 stop notification-daemon
```

## Troubleshooting

**Notifications not delivering?**
1. Check daemon is running: `pm2 status`
2. Check daemon logs: `pm2 logs notification-daemon`
3. Verify CONVEX_URL is set correctly
4. Check agent sessionKey exists in Convex

**Agent not receiving notifications?**
1. Agent must have active session (heartbeat creates session every 15min)
2. Check sessionKey matches in Convex agents table
3. Try manual send: `clawdbot sessions:send --session agent:name:main "test"`

**Duplicate notifications?**
- Each comment notifies subscribers once
- Auto-subscription prevents duplicate subscriptions
- Check if multiple daemons are running: `pm2 list`
