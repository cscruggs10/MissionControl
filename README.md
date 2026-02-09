# Mission Control

**Multi-agent task coordination system** for autonomous work execution.

## What This Is

A Clawdbot workspace with:
- **Mission Control UI** - Next.js dashboard for task management
- **Agent System** - Multiple AI agents coordinating via Convex backend
- **Notification System** - @mentions and thread subscriptions
- **Daily Standups** - Automated summaries
- **Heartbeat System** - Agents wake every 15min to check for work

## Structure

```
/root/clawd/
├── mission-control/        # Next.js UI + Convex backend
├── agents/                 # Agent workspaces (Jazz, Optimus Prime, etc.)
├── memory/                 # Daily logs and working memory
├── journal/                # Personal journal system
└── Workspace files:
    ├── AGENTS.md          # Agent system documentation
    ├── SOUL.md            # Iris identity
    ├── MEMORY.md          # Long-term curated memory
    ├── HEARTBEAT.md       # Heartbeat checklist
    └── TOOLS.md           # Local configuration notes
```

## Running Mission Control

```bash
cd mission-control
npm install
npm run dev
```

Dashboard: http://localhost:3000

## Agents

- **Iris** 🌸 - Interface & Coordinator
- **Optimus Prime** 🤖 - Squad Lead
- **Jazz** 🎨 - Designer

## Documentation

See `/mission-control/` directory for:
- `README.md` - Full Mission Control docs
- `NOTIFICATION_SYSTEM.md` - @mention system
- `DAILY_STANDUP.md` - Automated reporting
- `TASK_FLOW.md` - How tasks move through the system

## Deployment

Connected to Railway for auto-deployment from GitHub.

Repo: `git@github.com:cscruggs10/MissionControl.git`
