# 🔥 Skyfire - Twitter Engagement Agent

**Mission Control ID:** `j97176dftr3jkyst67qw1wz33d81fbpw`  
**Twitter Account:** `@scruggsCo`  
**Role:** Social Media Engagement Agent

---

## How Skyfire Works

### **Workflow:**

1. **Content Agent creates post** (Jazz, Prowl, Wheeljack)
   - Creates task in Mission Control with post copy
   - Assigns to Skyfire
   
2. **Skyfire posts to X**
   - Reads assigned tasks during heartbeat
   - Posts tweet text from task description
   - Comments with link to posted tweet
   - Marks task complete

3. **Engagement monitoring** (future)
   - Watches mentions/replies
   - Suggests response options
   - Creates approval tasks in Mission Control

---

## Creating a Posting Task

### Via CLI:
```bash
cd /root/clawd/mission-control
npx convex run tasks:create '{
  "title": "Post: Update about Ajax Partners",
  "description": "Just launched our new captive insurance comparison tool. Helping business owners see real savings. Check it out: https://ajaxpartners.com"
}'

# Then assign to Skyfire
npx convex run tasks:assign '{
  "id": "TASK_ID_HERE",
  "agentIds": ["j97176dftr3jkyst67qw1wz33d81fbpw"]
}'
```

### Via Mission Control UI:
1. Click "Add Task"
2. Title: "Post: [brief description]"
3. Description: The exact tweet text
4. Assign to Skyfire 🔥
5. Skyfire posts it on next heartbeat

---

## Task Format

**Title:** `Post: [brief description]`  
**Description:** The exact tweet text (up to 280 chars)  
**Assignee:** Skyfire

**Example:**
```
Title: Post: New blog on captive insurance
Description: 5 ways captive insurance can save your business $100K+ in taxes.

Our latest deep dive 👇
https://ajaxpartners.com/blog/captive-insurance-tax-savings
```

---

## Commands

### Manual test post:
```bash
cd /root/clawd/twitter-agent
node skyfire.js post "Test tweet from Skyfire 🔥"
```

### Check Skyfire's tasks:
```bash
node skyfire.js tasks
```

### Run heartbeat (process assigned tasks):
```bash
node skyfire.js heartbeat
```

---

## Automated Heartbeat

Skyfire wakes up every 15 minutes via cron to check for assigned posting tasks.

To enable:
```bash
crontab -e

# Add this line (Skyfire wakes at :08, :23, :38, :53)
8,23,38,53 * * * * cd /root/clawd/twitter-agent && node skyfire.js heartbeat >> /root/clawd/logs/skyfire.log 2>&1
```

---

## Credentials

Stored securely in `/root/clawd/.twitter-credentials`

- Consumer Key
- Consumer Secret  
- Access Token (Read and Write permissions)
- Access Token Secret

**Never commit this file to git!**

---

## Future Enhancements

- [ ] Engagement monitoring (mentions/replies)
- [ ] Response suggestion (create approval tasks)
- [ ] Thread support (post multi-tweet threads)
- [ ] Media upload (images, videos)
- [ ] Scheduled posting (time-based posting)
- [ ] Analytics tracking (engagement metrics)
- [ ] Keyword monitoring (join conversations)

---

## Integration with Other Agents

**Jazz (Designer):** Creates visual content, assigns posting task to Skyfire with image  
**Prowl (Ajax CMO):** Writes captive insurance content, assigns to Skyfire  
**Wheeljack (Deal Machine CMO):** Writes automotive content, assigns to Skyfire  

All content flows through Mission Control → Skyfire → Twitter

---

**Status:** ✅ Online and operational
