# MEMORY.md - Long-Term Memory

## My Name
**Iris** — Interface to Corey's operating system and commander of his agent army

## Corey's 2026 Theme
**DISCIPLINE** — Not just business, but how he wants to live life. This frames everything.

## Operating Rhythm (DO NOT MISS THESE)

### Morning Brief (8:00 AM CT / 14:00 UTC)
**Every morning**, lead with:
1. Today's primary task (what matters most?)
2. Context/why it matters
3. Habit streak status
4. Optional: weather, calendar highlights

**DO NOT** start with "What's on your mind?" or generic greetings. Deliver the brief.

### End-of-Day Debrief (8:30 PM CT / 02:30 UTC)
- Task completion check
- Habit logging (update tracker.md)
- Capture notes / migrate tasks
- Update all files automatically
- Show progress + celebrate wins

**Note:** Flexible timing - Corey will ping if needs to move earlier/later (kids, travel, etc.)

### Sunday Planning (Weekly)
- Weekly review (what worked/didn't)
- Update goal progress
- Set next week's priority
- Review habit performance

## Q1 2026 Habits
1. **Workout** - Daily physical activity
2. **Daily Planning & Task Tracking** - Complete planning, track tasks, migrate incomplete
3. **Food Logging** - Track daily intake in Lose It app

## Division of Labor
- **Corey:** Answers questions, makes decisions, stays in flow
- **Iris:** Tracks everything, updates docs, surfaces open loops, maintains rhythm, motivates

**KEY:** Corey does NOT have time to log in and update files. Everything happens via Telegram conversation. I handle all file updates, tracking, and documentation.

## Communication Style
- Brief and direct (Telegram-style)
- Confident recommendations, not menus
- Action-biased — do first, flag only when necessary

## Git/Version Control Rules
- **VERIFY REPO BEFORE PUSHING** — Always check `git remote -v` first
- **Correct repo:** `git@github.com:cscruggs10/MissionControl.git`
- **NEVER push to:** AutoIntel repo (that's a separate project)
- **ALWAYS push to git repo** — Never keep work local only
- Commit and push changes immediately after completing work
- This workspace is version-controlled, keep everything synced

**Pre-push checklist:**
```bash
cd /root/clawd
git remote -v  # Should show MissionControl.git, NOT AutoIntel.git
git status
git push origin main
```

## System Structure
- **Journal system:** `/root/clawd/journal/` (digital bullet journal)
  - `goals/` - Quarterly outcome goals (EOS-style rocks)
  - `weeks/` - Weekly planning
  - `days/` - Daily execution
  - `habits/tracker.md` - Habit tracking
  - `reviews/` - Weekly review templates
- **Memory:** `/root/clawd/memory/YYYY-MM-DD.md` (daily logs)
- **Business context:** `BUSINESS_CONTEXT.md`

## Multi-Agent System (Mission Control)

**Architecture:** Full Convex-backed task management system

**Core Components:**
1. **Convex Database** (mission-control/convex/)
   - agents, tasks, messages, documents, activities, notifications, subscriptions
   - Full schema deployed to kindly-hyena-65.convex.cloud

2. **Memory System** (memory/)
   - `WORKING.md` - Current task state (read FIRST on wake)
   - `YYYY-MM-DD.md` - Daily timestamped logs
   - `MEMORY.md` - Long-term curated learnings

3. **Heartbeat System**
   - Agents wake every 15min via cron (staggered by 2min)
   - Check HEARTBEAT.md for checklist
   - Load WORKING.md → Check @mentions → Check assigned tasks → Act or HEARTBEAT_OK

4. **Notification System** (mission-control/daemon/)
   - Daemon polls Convex every 2s for undelivered notifications
   - Delivers via sessions.send() API
   - @mention support (@agentname, @all)
   - Thread subscriptions (auto-subscribe on comment/mention/assign)

5. **Daily Standup** (mission-control/scripts/)
   - Cron fires daily at 11:30 PM IST (18:00 UTC)
   - Generates summary: Completed, In Progress, Blocked, Needs Review
   - Delivers to Telegram

**Current Squad:**
- **Iris** 🌸 (Interface & Coordinator) — session: `agent:main:main`
- **Optimus Prime** 🤖 (Squad Lead) — session: `agent:optimus-prime:main`
- **Jazz** 🎨 (Designer) — session: `agent:designer:main`

**Heartbeat Schedule (Staggered):**
- :00, :15, :30, :45 → Optimus Prime
- :02, :17, :32, :47 → Jazz
- (2-minute stagger to distribute load)

**Location:** `/root/clawd/mission-control/` and `/root/clawd/agents/`

**Docs:**
- mission-control/NOTIFICATION_SYSTEM.md
- mission-control/DAILY_STANDUP.md
- mission-control/daemon/README.md

## Recent Context (Last 3 Days)

**Jan 29:**
- Swim workout completed (goggles broke, finished anyway) ✅
- Food logged (126 cal under) ✅
- Built AutoNiq announcement scraper (ready to test)

**Jan 30:**
- No workout (weather issue) ❌
- Food logged (under 550 cal) ✅
- Planning incomplete (weather issue) ❌

**Jan 31:**
- Built AutoIntel frontend (CSV upload, auction name + date fields)
- Added `MARKETING_AGENT.md` — Ajax Partners GTM playbook

**Jan 31 Tasks (Migrated from Jan 30):**
- Send Greg sold info from DAA
- Get 3 more set aside for Keith w/ Columbus
- Start working on run list for next week

## Ajax Partners Marketing Strategy

**Two-Pronged Approach:**
1. **Alpha Directory** (https://wealthe-advisor-hub-production.up.railway.app/) — Capture business owners searching for tax savings via SEO/ads, route to partner advisors
2. **Wealth Systems** (https://cpacaptivelandingpage.vercel.app/) — Recruit CPAs/Advisors via direct outreach (Loom, calls, letters)

**Framework:** Digital Gravity (Cody Schneider) — Build mass through multi-touch outreach, not linear funnels

**Key Insight:** Two audiences, two messages:
- Business owners → Lead with tax savings (that's what they search for)
- Advisors → Lead with differentiation (stop being commoditized)

**Playbook:** `/root/clawd/MARKETING_AGENT.md` (ready for sub-agent)
