# Multi-Agent System — Getting Started

## What Just Got Built

**Optimus Prime** is online. Your first agent coordinator.

### File Structure

```
/root/clawd/
├── agents/
│   └── optimus-prime/
│       ├── SOUL.md              ← His identity and personality
│       └── memory/
│           └── WORKING.md       ← Current task state
├── tasks/
│   ├── README.md                ← Task system docs
│   └── task-001.md              ← First task (Ajax traffic strategy)
└── agents/README.md             ← This file
```

### What Optimus Does

**Every 15 minutes** (at :00, :15, :30, :45), he wakes up and:
1. Reads his `WORKING.md` to remember context
2. Checks `tasks/` folder for assigned work
3. Takes action or reports `HEARTBEAT_OK`

**When you give him work:**
- He breaks it into tasks
- Tracks progress in `tasks/` folder
- Updates his `WORKING.md`
- Reports back when done or blocked

### How to Talk to Optimus

**Option 1: Direct message (main session)**  
Just talk to me (Iris) and say "Tell Optimus..." — I'll route it.

**Option 2: Via session send**
```bash
clawdbot sessions send \
  --session "agent:optimus-prime:main" \
  --message "Your message here"
```

**Option 3: Task files**  
Create or update a task file in `tasks/` — he'll see it on his next heartbeat.

### Current Status

**Agent:** Optimus Prime  
**Session:** `agent:optimus-prime:main`  
**Heartbeat:** Every 15 min (using gemini-flash to save costs)  
**Next wake:** Check with `clawdbot cron list`

**Active Task:** task-001 (Ajax Partners traffic strategy)  
**Status:** Awaiting your direction

### Next Steps

1. **Give Optimus direction on task-001**  
   Which traffic strategy should he pursue? (LinkedIn, outreach, guest posts?)

2. **Watch him work**  
   He'll update task files with progress

3. **Add more agents when ready**  
   - Amplify (social/LinkedIn)
   - Scout (research/outreach)

### Checking In

**See all cron jobs:**
```bash
clawdbot cron list
```

**See Optimus's next heartbeat:**
```bash
clawdbot cron list --json | grep -A 10 optimus-prime
```

**Read his current state:**
```bash
cat agents/optimus-prime/memory/WORKING.md
```

**See all tasks:**
```bash
ls -la tasks/
```

---

**You're running multi-agent now. Start small, prove it works, then scale.**
