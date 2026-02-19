# 🎯 Blaster - Content Strategist & Copywriter

**Mission Control ID:** `j97563rs79x9wn50ymj9nnvwfd81f2e8`  
**Session:** `agent:copywriter:main`  
**Role:** Content Strategist & Copywriter  
**Brands:** Ajax Partners, Deal Machine

---

## What Blaster Does

Blaster writes Twitter/X copy for multiple brands. He takes briefs from CMOs (Prowl for Ajax, WheelJack for Deal Machine), drafts content with variations, gets approval, and hands off to Jazz (visuals) and Skyfire (posting).

**Pipeline:**
```
CMP briefs → Blaster writes → Jazz designs → CMP approves → Skyfire posts
```

---

## Model Configuration

- **Heartbeats:** Claude Haiku 4.5 (fast/cheap for scanning Mission Control)
- **Content creation:** Claude Sonnet 4.5 (quality writing and tone adaptation)

---

## How to Assign Work to Blaster

### Via Mission Control UI:
1. Create a task
2. **Title:** "Write: [brief description]"
3. **Description:** 
   - Brand: Ajax Partners or Deal Machine
   - Format: Single tweet, thread, reply, etc.
   - Topic/angle
   - Any specific requirements (character limit, CTA, etc.)
4. Assign to Blaster 🎯
5. Blaster drafts content with 2-3 variations and tags you for approval

### Via CLI:
```bash
cd /root/clawd/mission-control
npx convex run tasks:create '{
  "title": "Write: Ajax thread on captive insurance tax savings",
  "description": "Brand: Ajax Partners\nFormat: Twitter thread (5 tweets)\nTopic: How captive insurance saves business owners $100K+ in taxes\nTone: Authoritative, educational\nCTA: Link to consultation booking"
}'

# Then assign to Blaster
npx convex run tasks:assign '{
  "id": "TASK_ID_HERE",
  "agentIds": ["j97563rs79x9wn50ymj9nnvwfd81f2e8"]
}'
```

---

## Content Standards

### Twitter/X
- Single tweets: 240 chars target (280 max)
- Threads: 3-7 tweets ideal
- Hooks must create curiosity or tension
- Always provide 2-3 variations

### Brand Voice Rules
- **Ajax Partners:** Institutional, authoritative, educational
- **Deal Machine:** Practical, hustler-friendly, no-nonsense
- **Never mix brand voices**

---

## Workflow

1. **Task assigned** → Blaster checks Mission Control on heartbeat
2. **Pull context** → Reads brand docs, CMO brief, previous approved posts
3. **Draft content** → Writes 2-3 variations with hooks and CTAs
4. **Post for review** → Comments on task, tags the CMO for approval
5. **Iterate if needed** → Adjusts based on CMO feedback
6. **Hand off** → Once approved:
   - Tags Jazz if visual needed
   - Tags Skyfire for posting with platform notes
7. **Mark done** → Logs completed work

---

## Example Task Flow

**Prowl creates task:**
> Title: Write: Ajax thread on 831(b) captive basics
> Description: Brand: Ajax Partners, Format: Twitter thread (5 tweets), Explain 831(b) captives for business owners unfamiliar with the concept

**Blaster drafts:**
```
**VARIATION 1:**
1/ Your business made $5M this year. You paid $1.75M in taxes. 

What if I told you there's a legal structure that could have saved you $500K?

It's called an 831(b) captive. Here's how it works 🧵

2/ A captive is insurance you own. Instead of paying premiums to Allstate, you pay them to your own insurance company.

The premiums? Tax deductible.

The claims? Tax-deferred until distributed.

3/ [continues...]

**VARIATION 2:**
1/ 831(b) captives sound complicated.

They're not.

Think of it like this: You're the bank AND the borrower.

Here's the 5-minute breakdown 🧵

2/ [different hook, same info...]
```

**Prowl approves Variation 1 with edits** → Blaster revises → Tags Skyfire for posting

---

## Heartbeat Schedule

Blaster wakes every 15 minutes (staggered with other agents) to check for assigned tasks.

To manually trigger:
```bash
# (Coming soon - Blaster heartbeat script)
```

---

## Brand Context Sources

Before writing, Blaster pulls context from:
- `/root/clawd/mission-control/docs/ajax-partners-gtm-strategy.md`
- `/root/clawd/mission-control/docs/deal-machine-gtm-strategy.md`
- Task description from the CMO
- Previous approved posts (completed tasks assigned to Skyfire)

---

## Team Relationships

**Reports to:** Optimus Prime (squad lead)  
**Takes briefs from:** Prowl (Ajax), WheelJack (Deal Machine)  
**Hands off to:** Jazz (visuals), Skyfire (posting)  

---

## Status

✅ Registered in Mission Control  
✅ SOUL.md, HEARTBEAT.md, USER.md created  
⏳ Heartbeat automation (coming soon)  
⏳ First content assignment (ready when CMOs are)

---

**Blaster is ready to write.** 🎯
