# HEARTBEAT.md

## On Wake (Do in Order)

1. **Check Mission Control first** (lightweight):
   - Check for @mentions
   - Check for assigned tasks (YOU MUST: Get your agent ID first via `agents:list`, then filter tasks where YOUR ID is in `assigneeIds`)
   - Check activity feed

2. **Only if you find work**, then read memory/WORKING.md:
   - Check for ongoing task context
   - Resume work in progress
   - Search session memory if context unclear

3. **If nothing in Mission Control AND nothing in WORKING.md**, report HEARTBEAT_OK immediately

## Action Rules

**If you have assigned tasks:**
1. Move task to "in_progress" and start working
2. OR if you can't proceed (need assets, info, decisions), move to "blocked" and comment why
3. DO NOT just report HEARTBEAT_OK - assigned work means action required

**If you're blocked:**
1. Update task status to "blocked"
2. Post comment explaining what's blocking you
3. @mention who can unblock you
4. Then report HEARTBEAT_OK

**Only report HEARTBEAT_OK when:**
- No assigned tasks
- No @mentions
- No ongoing work in WORKING.md
- Nothing actionable in activity feed
