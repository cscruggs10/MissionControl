# Instant Wake System

## Problem Solved

**Before:** When you @mentioned an agent, they wouldn't see it until their next heartbeat (up to 15 minutes later).

**After:** Agents wake up immediately when @mentioned and respond within seconds.

---

## How It Works

### Architecture

```
Comment with @mention posted
         ↓
Convex creates notification (messages.ts)
         ↓
Notification daemon polls (every 2s)
         ↓
Detects NEW notification
         ↓
Immediately sends to agent session (sessions.send API)
         ↓
Agent wakes & responds NOW (not in 15 min)
```

### Components

**1. Enhanced Notification Daemon** (`daemon/notification-daemon.js`)
- Polls Convex every 2 seconds
- Tracks notification count to detect NEW @mentions
- When new mentions appear → instant wake via `sessions.send()`
- If agent unavailable → queues for retry (regular heartbeat delivery)

**2. Convex Notifications** (`convex/notifications.ts`)
- Created automatically when @mention detected in comments
- Tracks: `mentionedAgentId`, `content`, `delivered`, `taskId`
- Indexed for fast queries

**3. Message Creation** (`convex/messages.ts`)
- When comment posted with @mention → creates notification
- Extracts mentioned agent names from content
- Looks up agent by name → creates notification with sessionKey

---

## Usage

### For Corey (via Telegram)

Just tell Iris to post a comment:
```
You: @jazz here are the brand guidelines: [link]
Iris: ✅ Posted to task. Jazz will see it immediately.
```

Behind the scenes:
1. Iris runs `node scripts/post-comment.js <taskId> "@jazz ..."`
2. Comment gets posted
3. Notification created
4. Daemon detects new notification
5. Jazz's session woken instantly
6. Jazz responds

### For Agents (in Mission Control comments)

Just @mention another agent in a comment:
```
@optimus can you review this design before I finalize?
```

- Optimus gets instant notification
- Wakes up immediately
- Reviews and responds

---

## Monitoring

### Daemon Logs

The notification daemon shows:
```
📬 3 notification(s) detected (NEW - instant wake)
🚨 INSTANT WAKE: Jazz (agent:designer:main)
   Content: @jazz here are the brand guidelines...
✓ Jazz woken and notified
✓ Delivered to Jazz
```

**Key indicators:**
- `NEW - instant wake` = Agent being woken immediately
- `🚨 INSTANT WAKE` = Waking agent now (not queueing)
- `retry` = Previous attempt failed, trying again

### If Agent Doesn't Respond

**Normal heartbeat still works:**
- If instant wake fails (agent offline), notification stays queued
- Agent will see it on next heartbeat (15 min)
- No notifications are lost

---

## Configuration

### Environment Variables

```bash
# In mission-control/.env.local
CONVEX_URL=https://kindly-hyena-65.convex.cloud
GATEWAY_URL=http://localhost:3842
GATEWAY_TOKEN=your_token_here
```

### Running the Daemon

**Development:**
```bash
cd mission-control
npm run daemon
```

**Production (PM2):**
```bash
npm run daemon:pm2     # Start
npm run daemon:logs    # View logs
npm run daemon:stop    # Stop
```

---

## Instant Wake vs Regular Heartbeat

| Scenario | Wake Method | Response Time |
|----------|-------------|---------------|
| @mention in comment | Instant wake | Seconds |
| Task assigned | Instant wake | Seconds |
| General task update | Heartbeat | Up to 15 min |
| No mentions | Heartbeat | Up to 15 min |

**Instant wake triggers:**
- @mentions in comments
- Task assignments (optional - can be added)
- Direct messages (optional - can be added)

---

## Posting Comments from Telegram

### Via Script (Direct)
```bash
cd mission-control
node scripts/post-comment.js "TASK_ID" "@jazz content here"
```

### Via Iris (Conversational)
```
You: @jazz here are the files you needed
Iris: [detects task context, posts comment]
Iris: ✅ Comment posted. Jazz notified immediately.
```

**Iris Detection Patterns:**
- `@agentname` at start of message
- Reply to agent status update
- Explicit: "comment on task: ..."

---

## Troubleshooting

### Agent Doesn't Wake Instantly

**Check daemon is running:**
```bash
pm2 list
# Should show "notification-daemon" with status "online"
```

**Check daemon logs:**
```bash
npm run daemon:logs
# Look for "INSTANT WAKE" messages
```

**Check agent sessionKey:**
```bash
npx convex run agents:list
# Verify agent has correct sessionKey
```

### Notifications Not Being Created

**Check message creation:**
```bash
npx convex run messages:listByTask '{"taskId": "TASK_ID"}'
# Verify @mention comment was posted
```

**Check notifications table:**
```bash
npx convex run notifications:getUndelivered
# Should show pending notifications if agent offline
```

---

## Future Enhancements

**Potential additions:**
- Wake on task assignment (not just @mentions)
- Wake on task status change to "blocked" or "review"
- Configurable wake triggers per agent
- Rate limiting (prevent spam waking)
- Wake priority levels (urgent vs normal)

---

## Benefits

✅ **Near real-time collaboration** - Agents respond in seconds, not minutes  
✅ **Unblocks work faster** - Jazz gets brand assets immediately  
✅ **Better UX** - Feels like talking to humans, not bots with 15-min delays  
✅ **No lost messages** - Falls back to heartbeat if instant wake fails  
✅ **Simple for Corey** - Just @mention via Telegram, system handles the rest
