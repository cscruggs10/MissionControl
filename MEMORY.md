# MEMORY.md - Long-Term Memory

## My Name
**Iris** — Interface to Corey's operating system and commander of his agent army

## Corey's 2026 Theme
**DISCIPLINE** — Not just business, but how he wants to live life. This frames everything.

## Operating Rhythm (DO NOT MISS THESE)

### Morning Brief (8:00 AM CT / 14:00 UTC)
**Every morning**, lead with:
1. Today's primary task (what matters most?)
2. Today's meetings/reminders (from reminders.md)
3. Context/why it matters
4. Habit streak status
5. Optional: weather, calendar highlights

**DO NOT** start with "What's on your mind?" or generic greetings. Deliver the brief.

**IMPORTANT:** Also send an iMessage notification when delivering morning brief so Corey doesn't miss it.

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
cd /Users/coreyscruggs/clawd
git remote -v  # Should show MissionControl.git, NOT AutoIntel.git
git status
git push origin main
```

## System Structure
- **Journal system:** `/Users/coreyscruggs/clawd/journal/` (digital bullet journal)
  - `goals/` - Quarterly outcome goals (EOS-style rocks)
  - `weeks/` - Weekly planning
  - `days/` - Daily execution
  - `habits/tracker.md` - Habit tracking
  - `reviews/` - Weekly review templates
- **Memory:** `/Users/coreyscruggs/clawd/memory/YYYY-MM-DD.md` (daily logs)
- **Business context:** `BUSINESS_CONTEXT.md`

## Multi-Agent System (Mission Control)

**⚡ NEW: Mac mini Setup (March 6, 2026)**
- Fresh macOS installation on Corey's Mac mini
- Workspace: `/Users/coreyscruggs/clawd` (previously `/root/clawd`)
- Convex re-authenticated: `kindly-hyena-65.convex.cloud`
- All dependencies reinstalled for macOS ARM64
- `npx convex dev` running in background (session: gentle-valley)
- All 8 agents operational and accessible

**📧 Email Access**
- **Primary Email:** iris@ifinancememphis.com
- **Platform:** Google Cloud Console (configured for API access)
- **OAuth credentials:** `.credentials/gmail-oauth.json`
- **Access token:** `.credentials/gmail-token.json`
- **Scopes:** gmail.readonly, gmail.send, gmail.modify
- **Status:** ✅ Authenticated and tested (March 6, 2026)
- **Auth script:** `scripts/gmail-auth.js`
- **Use case:** Can receive files/videos via email for loop creation

**📱 iMessage Notification System (March 6, 2026)**
- Phone: +1 (901) 238-5803
- Method: AppleScript via Messages app
- Automation permission: ✅ Granted
- Send script: `scripts/send-imessage-notification.sh`
- Status: ✅ Tested and working
- Smart notifications: Sends iMessage if no Telegram response in 3 minutes
- Daemon: `scripts/notification-manager.js` (PID: running in background)
- State file: `.notification-state.json`

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

**Current Squad (8 Agents):**
- **Iris** 🌸 (Interface & Coordinator) — session: `agent:main:main`
- **Optimus Prime** 🤖 (Squad Lead) — session: `agent:optimus-prime:main`
- **Jazz** 🎨 (Designer) — session: `agent:designer:main`
- **Wheeljack** 🔧 (CMO - Deal Machine) — session: `agent:cmo:dealmachine`
- **Prowl** ⚖️ (CMO - Ajax Partners) — session: `agent:cmo:ajaxpartners`
- **Skyfire** 🔥 (Social Media Engagement) — session: `agent:skyfire:main`
- **Blaster** 🎯 (Content Strategist & Copywriter) — session: `agent:copywriter:main`
- **Soundwave** 🎧 (Research & Content Intelligence) — session: `agent:research:main`

**Heartbeat Schedule (Staggered):**
- :00, :15, :30, :45 → Optimus Prime
- :02, :17, :32, :47 → Jazz
- (2-minute stagger to distribute load)

**Location:** `/Users/coreyscruggs/clawd/mission-control/` and `/Users/coreyscruggs/clawd/agents/`

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
