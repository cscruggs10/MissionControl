# WORKING.md

## Current Status: Open Vehicle Loop + 5 Inbox Tasks

**Last updated:** 2026-03-20 20:30 CDT

### 🔄 Immediate Action Required

**Open Loop:**
- Vehicle 1000018149.mp4 (opened 3:49 PM) - needs completion

**Inbox Tasks (5) - from March 16 reminders:**
All still waiting for action/decision:
- Check LOS for deals
- Pay Cap One CC bill - Get check from Ajax
- Setup Purchase Agent - Ask DealPack about inventory API
- Check with Esther on deals
- Talk with Kyle about logging payments in DealPack

**Next Action:** Review these tasks with Corey — migrate forward, complete, or archive.

---

## Today's Wins (March 20)

**✅ Deal Machine:** 7 vehicles processed successfully  
System running smoothly, good volume day.

---

### 🧹 Today's Cleanup (March 14, 2026)
**Closed 4 stale loops:**
- ✅ 3 vehicle upload loops (#deal-machine) - no video files, 1-3 days old
  - `1000017136.mp4` (Mar 13)
  - `3803637471209939279.mp4` (Mar 11) 
  - `2906412146755019292.mp4` (Mar 11)
- ✅ 1 incomplete test loop (#wholesale-vehicles) - "Deal Machine posting"

**Result:** Both channels now have 0 open loops. System clean and ready.

---

### 🔒 Access Control Rules (ENFORCE STRICTLY)
- **Corey (id:6910769194):** FULL ACCESS to everything
- **Palmer (id:8654861772):** Deal Machine listings ONLY
  - Auto-process vehicle videos → create listings
  - Allow price changes
  - Block all other requests (tasks, questions, system access)

### 🚗 Deal Machine Vehicle Upload System
**Status:** ✅ Active & Working (Fixed 2026-03-17)

- **Upload interface:** Working at https://www.dealerdealmachine.com
- **Channel:** #deal-machine (kh79s0d7yt3mbpx9m2dy8f54f582hs33)
- **Workflow:** Palmer uploads → Cloudinary → Mission Control loop → Iris creates listing

**📋 CRITICAL: Read Skill EVERY TIME Palmer Uploads**
- **Quick Reference:** `~/clawd/skills/deal-machine/QUICK-REFERENCE.md`
- **Full Documentation:** `~/clawd/skills/deal-machine/SKILL.md`

**8-Step Process (With Auto-Extraction):**
1. **Get video URL** from Mission Control loop message (Cloudinary URL)
2. **Extract frames** from video and analyze with vision model
3. **Auto-extract VIN + mileage** (if visible in video)
4. **Ask Palmer:** If extraction worked → 2 fields (price, condition) | If failed → 4 fields (VIN, mileage, price, condition)
5. **Decode VIN** via NHTSA API → get make/model/year
6. **Create vehicle** with Cloudinary video URL
7. **Update to active** status
8. **Close loop** in Mission Control

**Key Lesson (2026-03-17):**
- ❌ DON'T hardcode `/uploads/filename.mp4`
- ✅ DO read `mediaUrl` from Mission Control loop message
- Videos upload to Cloudinary automatically via web interface
- Mission Control loop contains the correct Cloudinary URL

**IMPORTANT:** Always ask for ALL 4 fields - never assume!

---

## Previously Completed: ✅ Jazz Design Task SHIPPED

**Completed:** 2026-03-04 20:32 UTC

### ✅ Design Task COMPLETED & HANDED OFF
- Task (js7823wdxj8t6j04kzynfa5r0h81jbfr) moved to "done" status
- Final approval from @Prowl: 2026-03-04 20:14 UTC
- All three visual assets exported to PNG and ready for posting:
  - thread2-chart.png (52KB) - PRIMARY: Entity Structure comparison
  - thread3-icons.png (71KB) - 7 Deductions icon grid
  - thread1-checklist.png (48KB) - BONUS: Augusta Rule checklist
- Final handoff comment posted to @Skyfire with full instructions
- Next: @Skyfire executes Mon/Wed/Fri posting schedule

## Completed Today

### ⚖️ Prowl - Role Evolution: CMO → CMP (Chief Marketing & Partnerships)
**Status:** ✅ Complete Profile Update

**Major Changes:**
- **CRITICAL:** Compliance-first content review (IRS scrutiny protection)
- **Dual-brand strategy:** Wealth Systems (B2B) + Alpha Directory (B2C)
- **Funnel-focused:** Everything drives to 30-minute presentation booking
- **Partnership emphasis:** CPAs and Wealth Advisors as distribution channel

**Updated Files:**
- **SOUL.md:** New CMP role, compliance constraints, dual-brand voice guidelines
- **WORKING.md:** Compliance workflow, weekly rhythm, approval pipeline
- **MEMORY.md:** IRS-safe language guidelines, red/yellow/green flag criteria, content pillars

**Compliance Framework Added:**
- **Red Flags:** Specific tax savings claims, guarantees (automatic rejection)
- **Yellow Flags:** Vague claims, aggressive CTAs (requires revision)
- **Green Light:** Educational tone, compliance-safe language (approved)

**Content Approval Pipeline:**
```
Soundwave → Prowl (brief + compliance) → Blaster → Prowl (review) → Jazz → Prowl (final) → Skyfire
```

**Nothing ships without Prowl's compliance approval.**

**Agent ID:** j9786pw7xyfe8xx6pb68kaf8ax80w816  
**Session:** agent:cmp-ajax:main

---

### 🎧 Soundwave - Research & Content Intelligence
**Status:** ✅ Operational

- Agent ID: j975p7jfh4rk3qhx4mkj1ep30n81e0yg
- Monitors trends, competitors, news
- Creates content briefs for Prowl to filter

---

### 🎯 Blaster - Content Strategist & Copywriter
**Status:** ✅ Operational

- Agent ID: j97563rs79x9wn50ymj9nnvwfd81f2e8
- Writes copy from Prowl's approved briefs
- Delivers 2-3 variations per post

---

### 🔥 Skyfire - Twitter Engagement Agent
**Status:** ✅ Operational

- Agent ID: j97176dftr3jkyst67qw1wz33d81fbpw
- Twitter account: @scruggsCo
- Posts Prowl-approved content

---

## Content Team Pipeline

```
Soundwave (research) 
    ↓
Prowl (brief creation + compliance filter) ✅
    ↓
Blaster (copywriting) ✅
    ↓
Prowl (strategy + compliance review) ✅
    ↓
Jazz (design) ← TO BE BUILT
    ↓
Prowl (final approval) ✅
    ↓
Skyfire (posting & engagement) ✅
```

## Active Agents

1. **Iris** (me) - Personal assistant / Mission Control interface
2. **Skyfire** 🔥 - Twitter posting and engagement
3. **Blaster** 🎯 - Content copywriting
4. **Soundwave** 🎧 - Research and content intelligence
5. **Prowl** ⚖️ - CMP Ajax Partners (compliance & brand strategy)

## Still To Build

- **Jazz** 🎨 - Designer (creates visuals) - **NOW IN PROGRESS**
- **WheelJack** - CMO, Deal Machine (brand strategy & approval)
- **Optimus Prime** - Squad lead (coordinates the team)

---

## 🎨 Jazz - Visual Design Task

**Status:** ✅ COMPLETE & APPROVED BY PROWL (Final Review: 2026-02-21 06:06 UTC)

**Delivered:** 2026-02-21 04:34 UTC (14 hours ahead of deadline)

**DELIVERABLES:**

### ✅ Thread #1 - Augusta Rule Checklist (BONUS/LOW)
- File: `/root/clawd/assets/twitter/thread1-checklist.png` (48KB)
- Format: 1000x800, Twitter-optimized
- Content: 4-point IRS requirement checklist + compliance warning
- **Prowl Approval:** ✅ IRS-safe, appropriately cautious, valuable addition

### ✅ Thread #2 - Entity Structure Comparison Chart (HIGH - PRIMARY)
- File: `/root/clawd/assets/twitter/thread2-chart.png` (52KB)
- Format: 1200x675, Twitter-optimized
- Content: Sole Prop vs S-Corp side-by-side financial comparison
- Key visual: QBI trap highlighted effectively
- **Prowl Approval:** ✅ Perfect execution, ready for Monday (Feb 24)

### ✅ Thread #3 - 7 Deductions Icon Index (MEDIUM)
- File: `/root/clawd/assets/twitter/thread3-icons.png` (71KB)
- Format: 1200x1400, Twitter-optimized
- Content: All 7 deductions with emoji icons + descriptions in grid layout
- **Prowl Approval:** ✅ Clean, memorable, compliance disclaimer included

**Brand Compliance:** ✅ All assets cleared by Prowl
- Navy #0B3D91 + Light Blue #4A90E2 palette
- Professional, authoritative tone
- Clear typography hierarchy
- Compliance-focused messaging

**Status:** CLEARED FOR LAUNCH 🚀
Ready for @Skyfire posting. Recommended schedule: Mon/Wed/Fri rollout (Thread #2 leads).

## Active Tasks

### ⚖️ Prowl - Twitter Thread Content Creation
**Status:** ✅ Complete (updated 2026-02-20 09:36 UTC)

**Task:** Research topics for twitter threads (js75s26693a2dxp0fbqs3f3e6d81ghag)

**Outcome:** All three Twitter threads delivered on time. Ready for Corey's review and posting.

**Deliverables:**
- ✅ **Thread #1:** Augusta Rule ($14K Tax-Free Loophole) - 8 tweets, 266 avg chars
- ✅ **Thread #2:** Entity Structure Mistake ($52K Cost) - 10 tweets, 262 avg chars
- ✅ **Thread #3:** 7 Overlooked Deductions ($120K+) - 13 tweets, 270 avg chars

**File:** `/root/clawd/content/twitter-thread-drafts.md`

**Compliance review:** All threads self-reviewed and vetted for IRS-safe language, proper disclaimers, and conditional framing.

**Next Steps (Pending):**
1. Corey approval
2. Jazz design (if visuals needed)
3. Skyfire posting (recommended schedule: Mon/Wed/Fri)

**Recommended posting order:**
- Monday: Augusta Rule (viral potential)
- Wednesday: 7 Overlooked Deductions (value bomb)
- Friday: Entity Structure (deep-dive weekend read)
