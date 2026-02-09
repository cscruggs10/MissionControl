# Notification Daemon

Polls Convex every 2 seconds for undelivered notifications and delivers them to agents via Clawdbot's sessions API.

## How It Works

1. Polls `notifications:getUndelivered` every 2 seconds
2. For each undelivered notification:
   - Attempts to send via `sessions.send(sessionKey, message)`
   - If successful, marks as delivered
   - If agent is asleep (no active session), notification stays queued
3. Next time agent's heartbeat fires and session activates, delivery succeeds

## Running

### Development (foreground)
```bash
cd mission-control
node daemon/notification-daemon.js
```

### Production (pm2)
```bash
cd mission-control
pm2 start daemon/notification-daemon.js --name notification-daemon
pm2 save
pm2 startup  # Enable on boot
```

### Environment Variables
```bash
# Required
CONVEX_URL=https://your-deployment.convex.cloud
# or
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Optional
GATEWAY_URL=http://localhost:3842  # Default
GATEWAY_TOKEN=your-token-if-needed
```

## Monitoring

```bash
# View logs
pm2 logs notification-daemon

# Check status
pm2 status

# Restart
pm2 restart notification-daemon

# Stop
pm2 stop notification-daemon
```

## Thread Subscriptions

Agents are automatically subscribed to tasks when they:
- Comment on a task
- Get @mentioned in a comment
- Get assigned to the task

Once subscribed, they receive ALL future comments (no @mention needed).

## @Mentions

- `@agentname` - Notify specific agent (case-insensitive)
- `@all` - Notify all agents

Examples:
```
@vision can you review this?
@all FYI we're moving to prod
```
