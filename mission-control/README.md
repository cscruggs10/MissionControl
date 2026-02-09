# Mission Control

Agent task coordination system with Convex backend + Next.js frontend.

## Architecture

```
┌─────────────┐
│  Next.js UI │  Dark theme, task cards, modals
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Convex    │  Real-time database (agents, tasks, messages, etc.)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Daemons   │  Notification delivery, scheduled jobs
└─────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Convex (in one terminal)

```bash
npm run convex
```

### 3. Start Next.js (in another terminal)

```bash
npm run dev
```

### 4. Start Notification Daemon (optional, for @mentions)

```bash
npm run daemon:pm2
```

### 5. Open Mission Control

Navigate to: http://localhost:3000

## Features

### ✅ Implemented

- **Task Cards** - Inbox, Active, Done views
- **Task Modal** - Full task editor matching your design
- **Status Workflow** - Inbox → Assigned → In Progress → Review → Done
- **Agent Assignment** - Multi-select with avatars
- **Comments** - Thread-style discussions with @mentions
- **Real-time Updates** - Convex automatically syncs all clients
- **Notification Daemon** - Delivers @mentions to agent sessions
- **Daily Standup** - Automated daily summary to Telegram
- **Heartbeat System** - Agents wake every 15min to check for work

### 🚧 Coming Soon

- Drag & drop status changes
- File attachments for deliverables
- Activity timeline view
- Agent performance metrics
- Task templates

## File Structure

```
mission-control/
├── app/
│   ├── page.tsx              # Main dashboard (Inbox/Active/Done)
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Tailwind styles
│   └── components/
│       ├── TaskCard.tsx      # Task preview card
│       └── TaskModal.tsx     # Full task editor modal
├── convex/
│   ├── schema.ts             # Database schema
│   ├── agents.ts             # Agent CRUD
│   ├── tasks.ts              # Task CRUD + status/assign
│   ├── messages.ts           # Comments + @mention parsing
│   ├── documents.ts          # Deliverable management
│   ├── activities.ts         # Activity feed
│   ├── notifications.ts      # Notification queue
│   └── subscriptions.ts      # Thread subscriptions
├── daemon/
│   └── notification-daemon.js  # Polls + delivers notifications
├── scripts/
│   └── daily-standup.js      # Generates daily summary
└── package.json
```

## Database Schema

### agents
- name, role, status (idle/active/blocked)
- sessionKey (for Clawdbot sessions.send)
- emoji, lastHeartbeat

### tasks
- title, description, status, assigneeIds
- createdAt, updatedAt, createdBy

### messages
- taskId, fromAgentId, fromUser, content
- Parses @mentions, auto-subscribes participants

### subscriptions
- taskId, agentId, subscribedAt
- Auto-created on comment/mention/assign

### notifications
- mentionedAgentId, content, delivered
- Daemon polls and delivers via sessions API

### documents
- title, content, type (deliverable/research/protocol/notes)
- taskId, authorId

### activities
- type (task_created, message_sent, etc.)
- agentId, taskId, message, createdAt

## CLI Commands

### Convex

```bash
# Create a task
npx convex run tasks:create '{
  "title": "Research competitor pricing",
  "description": "Find 3 competitors...",
  "assigneeIds": ["..."]
}'

# Post a comment
npx convex run messages:create '{
  "taskId": "...",
  "content": "@vision check this out"
}'

# Update status
npx convex run tasks:updateStatus '{
  "id": "...",
  "status": "in_progress"
}'
```

### Daemon Management

```bash
# Start notification daemon
npm run daemon:pm2

# View logs
npm run daemon:logs

# Stop daemon
npm run daemon:stop
```

### Daily Standup

```bash
# Generate standup manually
npm run standup

# Scheduled via cron: 11:30 PM IST (18:00 UTC)
```

## Environment Variables

Create `.env.local`:

```bash
# Convex deployment URL (auto-generated)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Optional: Clawdbot gateway for notifications
GATEWAY_URL=http://localhost:3842
GATEWAY_TOKEN=your-token
```

## Deployment

### Convex (Backend)

```bash
# Deploy to production
npx convex deploy --prod
```

### Next.js (Frontend)

Deploy to Vercel, Netlify, or any Node.js host:

```bash
npm run build
npm run start
```

### Daemon (Notifications)

Run on same server as Clawdbot:

```bash
pm2 start daemon/notification-daemon.js --name notification-daemon
pm2 save
pm2 startup
```

## Documentation

- [Notification System](./NOTIFICATION_SYSTEM.md)
- [Daily Standup](./DAILY_STANDUP.md)
- [Daemon README](./daemon/README.md)

## Support

Issues? Questions? Ping Iris in Telegram.
# Auto-deploy test Mon Feb  9 02:28:43 UTC 2026
