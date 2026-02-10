# Multi-Agent System — Active Roster

## Current Agents

### **Optimus Prime** 🤖 - Squad Lead
**Session:** `agent:optimus-prime:main`  
**Heartbeat:** :00, :15, :30, :45  
**Role:** Coordinates agents, breaks down work, tracks progress

### **Jazz** 🎨 - Designer
**Session:** `agent:designer:main`  
**Heartbeat:** :02, :17, :32, :47  
**Role:** Social graphics, infographics, UI mockups, visual assets

### **Wheeljack** 🔧 - CMO (Deal Machine)
**Session:** `agent:cmo:dealmachine`  
**Heartbeat:** :04, :19, :34, :49  
**Role:** B2B marketing, paid ads, high-volume lead gen, conversion optimization

### **Prowl** ⚖️ - CMO (Ajax Partners)
**Session:** `agent:cmo:ajaxpartners`  
**Heartbeat:** :06, :21, :36, :51  
**Role:** Strategic marketing, SEO, digital gravity, dual-audience positioning

---

## File Structure

```
/root/clawd/
├── agents/
│   ├── optimus-prime/
│   │   ├── SOUL.md
│   │   ├── README.md
│   │   └── memory/WORKING.md
│   ├── jazz/
│   │   ├── SOUL.md
│   │   ├── README.md
│   │   └── memory/WORKING.md
│   ├── wheeljack/
│   │   ├── SOUL.md
│   │   ├── README.md
│   │   └── memory/WORKING.md
│   └── prowl/
│       ├── SOUL.md
│       ├── README.md
│       └── memory/WORKING.md
└── mission-control/          ← Central task management
    └── http://134.199.192.218:3000
```

---

## Mission Control

**URL:** http://134.199.192.218:3000

All agents check Mission Control every heartbeat for:
- Assigned tasks
- @mentions in task comments
- Activity feed updates

**Features:**
- Task creation and assignment
- @mention autocomplete (works on mobile)
- Status dropdown (inbox/assigned/in_progress/review/blocked/done)
- Instant wake notifications (agents respond within seconds)

---

## How Agents Work

### Heartbeat System
Every agent wakes every 15 minutes (staggered by 2 min) and:
1. Reads their `memory/WORKING.md` for context
2. Checks Mission Control for assigned tasks and @mentions
3. Takes action or reports `HEARTBEAT_OK`

### When You Assign Work
1. Create task in Mission Control
2. Assign to agent(s)
3. They pick it up on next heartbeat (or instantly if @mentioned)
4. Progress tracked in task comments
5. Status updates visible in UI

### Collaboration
- Agents coordinate through Mission Control task threads
- Jazz creates visuals when @mentioned by other agents
- CMOs can pull in Jazz for campaign assets
- All work tracked centrally

---

## Current Missions (Week 1)

### Wheeljack 🔧
**Task:** Build GTM strategy for Deal Machine  
**Deadline:** Friday, Feb 14  
**Status:** Just launched, starting discovery

### Prowl ⚖️
**Task:** Build GTM strategy for Ajax Partners  
**Deadline:** Friday, Feb 14  
**Status:** Just launched, starting discovery

### Jazz 🎨
**Task:** Design Ajax Partners social intro  
**Status:** BLOCKED - waiting for brand assets from Corey

---

## Checking Status

```bash
# See all cron jobs (heartbeat schedules)
clawdbot cron list

# View Mission Control
open http://134.199.192.218:3000

# Send message to specific agent
clawdbot sessions:send --session agent:cmo:dealmachine "Message here"

# Check agent's session history
clawdbot sessions:history --session agent:cmo:dealmachine
```

---

## Adding New Agents

1. Create directory: `mkdir -p agents/agent-name/memory`
2. Write `SOUL.md` (identity, personality, capabilities)
3. Create symlinks to shared files (AGENTS.md, HEARTBEAT.md, TOOLS.md, USER.md)
4. Initialize `memory/WORKING.md`
5. Register in Mission Control (get Convex agent ID)
6. Create cron heartbeat job (stagger by 2 min)
7. Assign first task

**Template available in existing agent directories.**

---

## Philosophy

**Agents are specialists, not generalists.**
- Wheeljack: Fast B2B marketing
- Prowl: Strategic long-term positioning
- Jazz: Visual design
- Optimus: Coordination

**Staggered heartbeats distribute load.**
- :00 Optimus, :02 Jazz, :04 Wheeljack, :06 Prowl
- Every 15 minutes, all 4 wake in 6-minute window

**Mission Control is source of truth.**
- All task assignments
- All progress updates
- All @mentions and notifications

---

**The roster is live. The system is operational. Let's build.**
