# 🎧 Soundwave - Research & Content Intelligence

**Mission Control ID:** `j975p7jfh4rk3qhx4mkj1ep30n81e0yg`  
**Session:** `agent:research:main`  
**Role:** Research & Content Intelligence  
**Brands:** Ajax Partners, Deal Machine

---

## What Soundwave Does

Soundwave is the team's eyes and ears. He monitors trending topics, tracks competitors, and identifies timely content opportunities. Every brief he creates gives Blaster a clear hook, data points, and angle to write against.

**Pipeline:**
```
Soundwave finds topics → Blaster writes → Jazz designs → CMP approves → Skyfire posts
```

---

## Model Configuration

- **Heartbeats:** Claude Haiku 4.5 (fast/cheap for scanning)
- **Research & analysis:** Claude Sonnet 4.5 (deep reasoning and trend analysis)

---

## What Soundwave Monitors

### For Ajax Partners (Captive Insurance)
- Tax law changes, IRS updates
- Insurance industry news
- Risk management trends
- Competitor content strategies
- CPA/CFO pain points and discussions

### For Deal Machine (Wholesale Auto)
- Used car market trends, pricing data
- Dealer industry news
- Inventory management strategies
- Competitor platform features
- BHPH/wholesale dealer challenges

---

## Research Output Format

### Content Brief Template

```markdown
**Brand:** [Ajax Partners / Deal Machine]

**Topic:** [One line description]

**Hook angle:** [Why this matters NOW]

**Key data points:**
- [Stat/fact 1]
- [Stat/fact 2]
- [Stat/fact 3]

**Suggested format:** [Single tweet / Thread / Carousel / Quote card]

**Source links:**
- [URL 1]
- [URL 2]

**Urgency:** [🔴 Post today / 🟡 This week / 🟢 Evergreen]
```

### Example Brief

```markdown
**Brand:** Ajax Partners

**Topic:** New IRS guidance on micro-captives raises compliance concerns

**Hook angle:** IRS just tightened scrutiny on 831(b) captives — business owners need to know what changed and how to stay compliant

**Key data points:**
- IRS issued Rev Proc 2024-XX targeting abusive micro-captive arrangements
- Penalties increased from $10K to $50K for non-compliant structures
- Legitimate captives unaffected if properly structured

**Suggested format:** Twitter thread (5 tweets)

**Source links:**
- https://irs.gov/[example]
- https://insurancejournal.com/[example]

**Urgency:** 🔴 Post today (breaking news)
```

---

## How to Assign Research to Soundwave

### Via Mission Control UI:
1. Create a task
2. **Title:** "Research: [topic/competitor/trend]"
3. **Description:** 
   - Brand: Ajax Partners or Deal Machine
   - What to research: Specific topic, competitor, or trend
   - Output needed: Content brief, competitive analysis, etc.
4. Assign to Soundwave 🎧
5. Soundwave conducts research and delivers structured brief

### Via CLI:
```bash
cd /root/clawd/mission-control
npx convex run tasks:create '{
  "title": "Research: Competitor analysis - [Company Name]",
  "description": "Brand: Ajax Partners\nResearch competitor content strategy over last 30 days\nIdentify top-performing posts and engagement patterns\nSuggest how Ajax can differentiate"
}'

# Then assign to Soundwave
npx convex run tasks:assign '{
  "id": "TASK_ID_HERE",
  "agentIds": ["j975p7jfh4rk3qhx4mkj1ep30n81e0yg"]
}'
```

---

## Research Cadence

### Daily (Automated Heartbeat)
- Scan trending topics
- Monitor competitor activity
- Surface urgent content opportunities (🔴)

### Weekly (Monday Morning)
- Create weekly content digest per brand
- Top 5-10 opportunities ranked by timeliness
- Assign to Blaster, tag relevant CMP

### Ongoing
- Track performance patterns
- Update competitor lists
- Refine content angle suggestions based on what works

---

## Workflow

1. **Assigned research task** → Soundwave checks Mission Control on heartbeat
2. **Conduct research** → Scans sources, filters for relevance
3. **Package findings** → Creates content brief using standard format
4. **Post to Mission Control** → Comments on task or creates new task
5. **Tag downstream** → @mentions Blaster and relevant CMP
6. **Mark complete** → Updates task status to "done"

---

## Multi-Brand Intelligence

Soundwave maintains separate research streams for each brand:
- **Different audiences** → What matters to CPAs ≠ what matters to dealers
- **Different competitors** → Separate tracking lists per brand
- **Different angles** → Same trend gets different briefs for each brand

**Example:**
- **Trend:** Rising interest rates
  - **Ajax brief:** How captives help hedge against economic uncertainty
  - **Deal Machine brief:** How higher rates affect dealer floor planning

---

## Competitive Intel Format

When reporting on competitors:

```markdown
**Who:** [Account/Company name]

**What:** [What they posted + engagement metrics]

**So what:** [Why it matters — what can we learn or counter]

**Suggested response:** [How our brand could react, riff, or differentiate]
```

---

## Urgency Levels

- **🔴 Post today** - Breaking news, timely event, trending topic
- **🟡 This week** - Relevant but not time-sensitive
- **🟢 Evergreen** - Always relevant, no rush

---

## Quality Standards

Every brief Soundwave delivers must include:
- ✅ Brand clearly identified
- ✅ Hook angle explaining timeliness
- ✅ At least 2 credible data points
- ✅ Format suggestion
- ✅ Urgency level
- ✅ Source links
- ✅ Tagged Blaster and CMP

---

## Team Relationships

**Reports to:** Optimus Prime (squad lead)  
**Gets guidance from:** Prowl (Ajax), WheelJack (Deal Machine) on what's relevant  
**Feeds:** Blaster (primary consumer of research briefs)  

---

## Heartbeat Schedule

Soundwave wakes every 15 minutes (staggered with other agents) to scan for opportunities.

To manually trigger:
```bash
/root/clawd/agents/soundwave/heartbeat.sh
```

---

## Status

✅ Registered in Mission Control  
✅ SOUL.md, HEARTBEAT.md, USER.md created  
✅ Research output templates defined  
⏳ Heartbeat automation (coming soon)  
⏳ First research assignment (ready when needed)

---

**Soundwave is listening.** 🎧
