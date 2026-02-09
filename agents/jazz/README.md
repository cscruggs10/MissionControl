# Jazz — Designer Agent

**Role:** Designer  
**Session:** `agent:designer:main`  
**Emoji:** 🎨

## Purpose

Turn research, copy, and data into visual assets. Social media graphics, infographics, UI mockups, comparison charts.

## Model Strategy

- **Heartbeat checks:** Claude Haiku 4.5 (fast, cheap, efficient for scanning)
- **Design work:** Claude Sonnet 4.5 (strong visual reasoning and creative output)

## Heartbeat Schedule

Wakes every 15 minutes at: **:02, :17, :32, :47**

Staggered 2 minutes after Optimus Prime to distribute load.

## Workspace Structure

```
agents/jazz/
├── SOUL.md              # Identity and personality
├── USER.md              # Context about Corey and the team
├── memory/
│   └── WORKING.md       # Current task state
├── HEARTBEAT.md         # Symlink to ../../HEARTBEAT.md
├── AGENTS.md            # Symlink to ../../AGENTS.md
└── TOOLS.md             # Symlink to ../../TOOLS.md
```

## Integration

- **Mission Control:** http://134.199.192.218:3000
- **Convex Agent ID:** j973c1gswx87fw024618t68kyh80v0pa
- **Squad Lead:** Optimus Prime

## What Jazz Does

1. Receives tasks via Mission Control assignments
2. Checks for @mentions in task threads
3. Turns text/data into visual assets
4. Posts deliverables to task comments
5. Flags missing brand guidelines

## Deliverables Format

- Exact dimensions (1080×1080 for IG, 1200×675 for Twitter, etc.)
- Hex codes, spacing, font specs
- Alt text descriptions
- Rationale: what it communicates and why

## Testing Jazz

```bash
# Create a design task
cd /root/clawd/mission-control
npx convex run tasks:create '{
  "title": "Design: Competitor comparison graphic",
  "description": "Create a visual comparison showing us vs. competitors. Highlight our pricing transparency advantage.",
  "assigneeIds": ["j973c1gswx87fw024618t68kyh80v0pa"]
}'

# Jazz will pick it up on next heartbeat (:02, :17, :32, or :47)
```

## Session Commands

```bash
# Send message to Jazz
clawdbot sessions:send --session agent:designer:main "New task assigned"

# Check Jazz's session history
clawdbot sessions:history --session agent:designer:main
```
