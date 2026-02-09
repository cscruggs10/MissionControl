# Task Flow - How Tasks Move Through Mission Control

## The Lifecycle

```
Inbox → Assigned → In Progress → Review → Done
                         ↓
                     Blocked (temporary)
```

### 1. **Inbox** 📥
- New, unassigned tasks
- Waiting for assignment
- Anyone can claim or assign

### 2. **Assigned** 📌
- Has owner(s)
- Not started yet
- Agents know it's theirs

### 3. **In Progress** 🔄
- Being actively worked on
- Updates posted to comments
- Collaboration happens here

### 4. **Review** 👀
- Work is done
- Needs approval/feedback
- Reviewers give feedback, agent revises

### 5. **Done** ✅
- Finished and approved
- Archived for reference
- Shows in daily standup as "Completed"

### 6. **Blocked** 🚫
- Stuck, needs something resolved
- Waiting on external input (brand assets, access, decisions)
- Gets special attention - surfaces in standups and alerts

---

## Real Example: Competitor Comparison Page

**Task:** Create a competitor comparison page

### Day 1
- Task created, assigned to **Vision** (SEO Analyst) and **Loki** (Content Writer)
- Vision posts keyword research → Target keyword gets decent search volume
- **Fury** (Researcher) sees it in activity feed, adds competitor intel
  - G2 reviews, pricing complaints, common objections
- **Shuri** (Product Analyst) tests both products
  - Posts UX notes: "Here's how the UX differs"

### Day 2
- Loki starts drafting
- Uses Vision's keywords, Fury's competitive intel, Shuri's UX notes
- Everything is in ONE task thread

### Day 3
- Loki posts first draft → Status moves to **Review**
- Corey reviews, gives feedback
- Loki revises based on feedback → Status moves to **Done**

**Result:**
- All comments on ONE task
- Full history preserved
- Anyone can see the whole journey
- Cross-functional collaboration without meetings

---

## Status Transitions

### Automatic
- Assign agents → `inbox` → `assigned`
- Agent heartbeat picks up task → `assigned` → `in_progress`

### Manual (via Mission Control UI or CLI)
- Agent finishes work → `in_progress` → `review`
- After approval → `review` → `done`
- Hit blocker → any status → `blocked`
- Blocker resolved → `blocked` → `in_progress`

---

## When to Use Blocked

Use **Blocked** when:
- Waiting for external assets (logo, brand guidelines, API access)
- Waiting for a decision from Corey
- Technical blocker (can't proceed without X)
- Dependency on another task

When you mark a task as **Blocked**, add a comment explaining:
- What's blocking it
- Who/what you're waiting for
- What happens once unblocked

Example:
```
Status: Blocked
Comment: "Need Ajax Partners brand guidelines (logo, colors, fonts) to proceed with social media designs. @corey can you provide these?"
```

---

## Activity Feed

Every action creates an activity:
- Task created
- Agent assigned
- Status changed
- Comment posted
- Document attached

This feeds the daily standup and keeps everyone in sync.

---

## Best Practices

1. **Move tasks forward** - Update status as you progress
2. **Comment frequently** - Post updates, questions, progress
3. **@mention for input** - Pull in other agents when needed
4. **Use Blocked** - Don't let stuck tasks linger in "In Progress"
5. **One task = one deliverable** - Break big projects into multiple tasks

---

## CLI Commands

```bash
# Move to In Progress
npx convex run tasks:updateStatus '{
  "id": "...",
  "status": "in_progress"
}'

# Mark as Blocked
npx convex run tasks:updateStatus '{
  "id": "...",
  "status": "blocked"
}'

# Add blocker comment
npx convex run messages:create '{
  "taskId": "...",
  "content": "Blocked: Waiting for brand assets from @corey"
}'
```
