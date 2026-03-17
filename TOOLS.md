# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

## Mission Control - Loop & Task Management

### Creating Loops

**Via Telegram (Corey only):**
Just tell me what you need:
- "Create loop: Post this car to Deal Machine"
- "New loop in wholesale-vehicles: Instagram post for 3 vehicles"

**Via Web Page (Field Workers):**
- Open `/loop-creator` on mobile
- Upload files if needed
- Chat with me (Iris) to create the loop
- I'll handle the conversation and create it

**Behind the scenes:**
- All loops are created by me (Iris)
- I assign agents based on task type
- I watch for patterns to suggest new skills

### When Corey Sends a Task via Telegram

**Patterns to recognize:**
- "task: [description]"
- "create task: [description]"
- "new task: [description]"
- "add task: [description]"
- "due [date]: [description]" or "deadline [date]: [description]"

**Create the task:**
```bash
cd /root/clawd/mission-control
npm run task:create "task: research competitor pricing models"
```

**Create task WITH due date:**
```bash
cd /root/clawd/mission-control

# Get timestamp for due date (e.g., Feb 25, 2026 at 5pm UTC)
DUE_DATE=$(date -d "2026-02-25 17:00:00 UTC" +%s)000  # Add 000 for milliseconds

npx convex run tasks:create '{
  "title": "Complete GTM Strategy",
  "description": "Finish the go-to-market plan for Ajax Partners",
  "dueDate": '$DUE_DATE'
}'
```

**Quick date conversions:**
```bash
# Tomorrow at 5pm UTC
date -d "tomorrow 17:00 UTC" +%s
# Friday at EOD
date -d "friday 23:59 UTC" +%s
# In 3 days
date -d "+3 days" +%s
```

**Response format:**
> ✅ Task created! Added to Mission Control inbox.
> Due: Feb 25, 2026 at 5:00 PM UTC
> 
> 📋 View at http://134.199.192.218:3000

**If Corey wants to assign agents:**

Ask which agents, then get their IDs:
```bash
npx convex run agents:list
```

Then assign:
```bash
npx convex run tasks:assign '{
  "id": "js723rp880he5xyafd05xgrjhs80v3c0",
  "agentIds": ["j978rk5zw2tv9m7ev4bmx9b9k980vge3"]
}'
```

This automatically moves the task from Inbox → Assigned.

**Update due date on existing task:**
```bash
DUE_DATE=$(date -d "2026-03-01 17:00 UTC" +%s)000
npx convex run tasks:updateDueDate '{
  "id": "js723rp880he5xyafd05xgrjhs80v3c0",
  "dueDate": '$DUE_DATE'
}'
```

---

### When Corey Wants to Comment on a Task

**Patterns to recognize:**
- "@jazz here are the brand assets: [link]"
- "comment on task: [content]"
- Reply to agent status update with additional info
- Any message that's clearly responding to an agent about a task

**How to handle:**
1. Ask which task (if not clear from context)
2. Post the comment to that task:

```bash
cd /root/clawd/mission-control
node scripts/post-comment.js "TASK_ID" "@jazz Here are the brand guidelines: https://..."
```

**Response format:**
> ✅ Comment posted to task!
> 
> @jazz will see it immediately (instant wake notification)

**What happens:**
- Comment gets added to task thread
- If @mention is used, agent gets notified instantly (doesn't wait for heartbeat)
- Agent wakes up and responds within seconds

**Finding task IDs:**
```bash
# List recent tasks
npx convex run tasks:list '{}'

# Search by keyword
npx convex run tasks:list '{}' | grep -i "social media"
```

### Alternative Methods

**Via Convex directly:**
```bash
cd /root/clawd/mission-control
npx convex run tasks:create '{
  "title": "Research competitor pricing",
  "description": "Find 3 competitors and document pricing structure"
}'
```

**Via Mission Control UI:**
Corey can click "Add Task" button at http://134.199.192.218:3000

## Git Workflow

### Before Pushing Code

**ALWAYS confirm the repository with Corey before pushing:**

```bash
# Check current remote
git remote -v
```

**Format:**
> About to push to: `github.com:cscruggs10/MissionControl.git`
> 
> Confirm this is the right repo?

Wait for explicit approval before running `git push`.

**Exception:** If Corey explicitly says "push to [repo]" in the request, you can proceed directly.

---

## Email

**Iris Email:** iris@ifinancememphis.com  
**Corey Email:** corey@ifinancememphis.com

**How to send email:**
```bash
node scripts/gmail-send.js "recipient@example.com" "Subject" "Email body"
```

**Setup:** Gmail OAuth credentials stored in `.credentials/gmail-oauth.json` and `.credentials/gmail-token.json`

---

## What Goes Here

Things like:
- Camera names and locations
- SSH hosts and aliases  
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras
- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH
- home-server → 192.168.1.100, user: admin

### TTS
- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

## Deal Machine Vehicle Uploads

**Website:** https://www.dealerdealmachine.com  
**Skill:** `~/clawd/skills/deal-machine/SKILL.md`  
**Quick Reference:** `~/clawd/skills/deal-machine/QUICK-REFERENCE.md` ⭐ **READ THIS EVERY TIME**

**Workflow:**
- When Palmer (id:8654861772) uploads vehicle video
- **FIRST:** Read QUICK-REFERENCE.md (has complete step-by-step)
- Get video URL from Mission Control loop (Cloudinary URL)
- Ask for: VIN (17 chars), mileage, price, condition
- Create listing with Cloudinary video URL
- Close loop

**Access control:**
- Palmer: Deal Machine listings ONLY (no tasks, no system access)
- All uploads go through #deal-machine channel

---

Add whatever helps you do your job. This is your cheat sheet.
