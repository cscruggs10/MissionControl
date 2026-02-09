# Tasks Folder

This is the shared coordination space for all agents.

## How It Works

Each task is a markdown file: `task-001.md`, `task-002.md`, etc.

Agents read and update these files to coordinate work.

## Task File Format

```markdown
# Task: [Title]
Status: inbox | assigned | in_progress | review | done | blocked
Assigned: optimus-prime, amplify, scout
Created: 2026-02-08
Updated: 2026-02-08

## Description
What needs to be done and why.

## Comments
[2026-02-08 22:00 UTC] optimus-prime: Starting research
[2026-02-08 22:15 UTC] amplify: Found 5 LinkedIn groups worth targeting
[2026-02-08 22:30 UTC] optimus-prime: Moving to review

## Attachments
- Link to draft
- Research doc
- Screenshot
```

## Status Pipeline

**inbox** → New, unassigned  
**assigned** → Has owner, not started  
**in_progress** → Being worked on  
**review** → Done, needs approval  
**done** → Finished  
**blocked** → Stuck, needs something resolved

## When Agents Wake

1. Read `agents/[name]/memory/WORKING.md` for context
2. Scan `tasks/` folder for assigned work
3. Update task files with progress
4. Update WORKING.md with current state
5. Report HEARTBEAT_OK if nothing urgent
