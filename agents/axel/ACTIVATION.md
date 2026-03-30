# Axel Activation Summary

**Date:** March 29, 2026  
**Agent ID:** j97atsm6pvkc4k76g4xj4em63583wkpe  
**Session Key:** agent:axel:main

## ✅ What's Complete

### 1. Mission Control Registration
- Registered as agent in Convex database
- Name: Axel 🚗
- Role: Wholesale Vehicle Sales Agent

### 2. Go High Level Integration
- API Key configured and tested
- Location: Dealer Deal Machine (VmfxSFvGeB2kXGGxuDIB)
- Permissions verified:
  - ✅ Read contacts (22 dealers found)
  - ✅ Read/send messages
  - ✅ Access conversation history

### 3. Draft-and-Approve Workflow
- Created HEARTBEAT.md with monitoring workflow
- Created ghl-monitor skill
- State tracking file initialized (.processed-messages.json)

## 🔄 Draft-and-Approve Workflow

**How it works:**

1. **Every 15 minutes**, Axel wakes up via heartbeat
2. **Checks GHL** for new inbound dealer messages
3. **Reads context**: conversation history, dealer profile, past purchases
4. **Drafts response** using his sales voice (brief, familiar, direct)
5. **Posts to Mission Control** as a task assigned to you:
   - Shows dealer context
   - Shows their message
   - Shows his drafted response
6. **Waits for your approval**:
   - Comment "send" → sends as drafted
   - Comment "send [new text]" → sends edited version
   - Comment "cancel" → doesn't send, marks complete
7. **Sends via GHL API** after approval
8. **Logs everything** in processed messages

## ⚙️ What's Needed to Activate

### Option A: Manual Testing First (Recommended)
Test the workflow manually before scheduling:

```bash
# Send heartbeat to Axel
openclaw sessions send --label axel "Read HEARTBEAT.md and execute your workflow. Check for new GHL messages and draft responses."
```

This lets you see how he drafts responses before committing to automation.

### Option B: Schedule Heartbeat (Full Automation)
Add to crontab for automatic waking every 15 minutes:

```bash
# Edit crontab
crontab -e

# Add Axel's heartbeat (stagger at :04, :19, :34, :49)
4,19,34,49 * * * * /usr/local/bin/openclaw sessions send --label axel "$(cat /Users/coreyscruggs/clawd/HEARTBEAT.md | head -1)" 2>&1 | logger -t axel-heartbeat
```

## 📊 How You'll Interact

**Via Mission Control:**
- Task appears: "Approve response to [dealer name]"
- You see: dealer context + their message + Axel's draft
- You comment: "send" (or edit it)
- Axel sends on next heartbeat check (~5 min)

**Via Telegram (through Iris):**
You can also approve via Telegram - Iris can relay approval commands to Mission Control.

## 🛡️ Safety Features

1. **Nothing sends without approval** - Every message waits for "send" command
2. **Full context provided** - You see conversation history before approving
3. **State tracking** - Prevents duplicate processing
4. **Respects DND** - Won't message opted-out contacts
5. **Audit trail** - Everything logged in Mission Control + GHL

## 🎯 Next Steps

**Choose your activation path:**

1. **Test First** (safer): Send manual heartbeat, see how he drafts
2. **Schedule Heartbeat** (automated): Add to cron, let him monitor 24/7

Which would you like?
