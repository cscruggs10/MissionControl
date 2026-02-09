# Daily Standup

## Overview

Every day at 11:30 PM IST (18:00 UTC), a cron job generates and delivers a summary of all agent activity to Telegram.

## Purpose

- **Daily snapshot** - See what got done without watching Mission Control constantly
- **Accountability** - If an agent claims they're working but nothing shows in standups, something's wrong
- **Pattern recognition** - Track velocity, bottlenecks, and agent performance over time

## Format

```markdown
📊 DAILY STANDUP — Jan 30, 2026

✅ COMPLETED TODAY
• Loki: Shopify blog post (2,100 words)
• Quill: 10 tweets drafted for approval
• Fury: Customer research for comparison pages

🔄 IN PROGRESS
• Vision: SEO strategy for integration pages
• Pepper: Trial onboarding sequence (3/5 emails)

🚫 BLOCKED
• Wanda: Waiting for brand colors for infographic

👀 NEEDS REVIEW
• Loki's Shopify blog post
• Pepper's trial email sequence

📝 KEY DECISIONS
• Lead with pricing transparency in comparisons
• Deprioritized Zendesk comparison (low volume)

💚 Active Agents: Optimus Prime, Iris
😴 Idle Agents: Vision, Loki
```

## How It Works

1. **Cron fires** at 18:00 UTC daily (11:30 PM IST)
2. **Script runs** `mission-control/scripts/daily-standup.js`
3. **Queries Convex** for:
   - All tasks updated today
   - Activities from the last 24 hours
   - Agent heartbeat status
4. **Categorizes** by task status:
   - ✅ Done → Completed Today
   - 🔄 In Progress → In Progress
   - 🚫 Blocked → Blocked
   - 👀 Review → Needs Review
5. **Formats** into readable report
6. **Delivers** to Telegram via Clawdbot

## Manual Run

Test the standup anytime:

```bash
cd mission-control
node scripts/daily-standup.js
```

Or trigger the cron immediately:

```bash
clawdbot cron:run --name daily-standup
```

## Configuration

### Change Time

Default: 11:30 PM IST (18:00 UTC)

To change:

```bash
# List crons
clawdbot cron:list

# Update schedule (example: 9 PM IST = 15:30 UTC)
clawdbot cron:update daily-standup --schedule "30 15 * * *"
```

### Change Delivery Channel

By default, delivers to your last active channel (Telegram). To change:

1. Edit the cron job
2. Set specific channel in `payload.channel`

```bash
clawdbot cron:update daily-standup --channel telegram
```

## Monitoring

```bash
# View recent standup runs
clawdbot cron:runs daily-standup

# Check next run time
clawdbot cron:list | grep daily-standup

# View logs
clawdbot cron:logs daily-standup
```

## Customization

Edit `mission-control/scripts/daily-standup.js` to customize:

- Which activities to include
- How tasks are categorized
- Report formatting
- Additional metrics (commits, documents, etc.)

After changes, the next scheduled run will use the updated script.

## Troubleshooting

**No standup delivered?**
1. Check cron is enabled: `clawdbot cron:list`
2. Check recent runs: `clawdbot cron:runs daily-standup`
3. Test manually: `node scripts/daily-standup.js`
4. Verify CONVEX_URL is set in environment

**Empty standup?**
- No tasks were updated today (expected on quiet days)
- Script shows "No significant activity today"
- Agents may need to update task statuses via Mission Control

**Wrong time zone?**
- Cron runs on UTC
- 11:30 PM IST = 18:00 UTC
- Use [cron calculator](https://crontab.guru) to convert
