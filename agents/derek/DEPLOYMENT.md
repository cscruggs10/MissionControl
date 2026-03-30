# Axel Deployment Guide

## Status: Ready to Deploy (Pending Slack Setup)

Axel is fully built with all skills and configuration files. To deploy him to a Slack channel, follow these steps when you have access to the Mac mini.

---

## Step 1: Create Slack App & Get Tokens

### Option A: Create New Slack App

1. Go to https://api.slack.com/apps
2. Click **"Create New App"** → **"From a manifest"**
3. Select your workspace
4. Paste this manifest:

```json
{
  "display_information": {
    "name": "Axel - Deal Machine Sales",
    "description": "Wholesale vehicle sales agent"
  },
  "features": {
    "bot_user": {
      "display_name": "Axel",
      "always_online": true
    },
    "app_home": {
      "messages_tab_enabled": true,
      "messages_tab_read_only_enabled": false
    }
  },
  "oauth_config": {
    "scopes": {
      "bot": [
        "chat:write",
        "channels:history",
        "channels:read",
        "groups:history",
        "groups:read",
        "im:history",
        "im:read",
        "users:read",
        "app_mentions:read",
        "reactions:read",
        "reactions:write",
        "files:write"
      ]
    }
  },
  "settings": {
    "socket_mode_enabled": true,
    "event_subscriptions": {
      "bot_events": [
        "app_mention",
        "message.channels",
        "message.groups",
        "message.im",
        "reaction_added",
        "reaction_removed"
      ]
    }
  }
}
```

5. **Enable Socket Mode:**
   - Go to **Socket Mode** in left sidebar
   - Toggle **ON**
   - Click **Generate Token and Scopes**
   - Add scope: `connections:write`
   - Name it: "Axel Socket"
   - **Copy the App Token** (starts with `xapp-...`)

6. **Get Bot Token:**
   - Go to **OAuth & Permissions**
   - Click **Install to Workspace**
   - **Copy the Bot User OAuth Token** (starts with `xoxb-...`)

7. **Invite Bot to Channel:**
   - Go to your Slack channel (e.g., `#wholesale-vehicles`)
   - Type `/invite @Axel`

### Option B: Use Existing Slack App

If you already have a Clawdbot Slack app:
- Get the tokens from **OAuth & Permissions** and **Socket Mode**
- We can share the same tokens across multiple agents

---

## Step 2: Configure Clawdbot

Run this command on the Mac mini:

```bash
clawdbot gateway config.patch --raw '{
  "agents": {
    "list": [
      {
        "id": "axel",
        "name": "Axel",
        "workspace": "/Users/coreyscruggs/clawd/agents/axel",
        "model": {
          "primary": "anthropic/claude-sonnet-4-5"
        },
        "emoji": "🚗",
        "description": "Wholesale vehicle sales agent for Deal Machine"
      }
    ]
  },
  "channels": {
    "slack": {
      "enabled": true,
      "botToken": "YOUR_BOT_TOKEN_HERE",
      "appToken": "YOUR_APP_TOKEN_HERE",
      "groupPolicy": "allowlist",
      "channels": {
        "#YOUR-CHANNEL-NAME": {
          "allow": true,
          "agent": "axel",
          "requireMention": false
        }
      }
    }
  }
}'
```

**Replace:**
- `YOUR_BOT_TOKEN_HERE` → Your `xoxb-...` token
- `YOUR_APP_TOKEN_HERE` → Your `xapp-...` token
- `#YOUR-CHANNEL-NAME` → The channel Axel should monitor (e.g., `#wholesale-vehicles` or `#deal-machine`)

---

## Step 3: Restart Clawdbot

```bash
clawdbot gateway restart
```

Axel will come online in the configured Slack channel.

---

## Step 4: Test Axel

In the Slack channel, try:

```
Create a social media post for this vehicle:
2016 GMC Yukon SLT
145k miles
$15,775
Clean CarFax
```

Axel should respond with marketing copy using his skills.

---

## What Channels Should Axel Monitor?

**Recommended options:**

1. **`#wholesale-vehicles`** - Dedicated channel for vehicle sales
2. **`#deal-machine`** - Existing channel (if you have one)
3. **Create new channel** - `#axel-sales` specifically for him

**Settings:**
- `requireMention: false` → Axel responds to all messages in channel
- `requireMention: true` → Only responds when @mentioned

---

## Axel's Capabilities in Slack

Once deployed, Axel can:

✅ Monitor vehicle uploads  
✅ Create social media posts (Instagram/Facebook)  
✅ Write vehicle descriptions  
✅ Generate email/SMS copy  
✅ Create ad variations  
✅ Analyze buyer patterns  
✅ Suggest outreach strategies  

---

## Example Workflows

### 1. Vehicle Upload
**Palmer uploads vehicle → Axel notified**

You in Slack:
```
New vehicle: 2018 F-150 XLT 4x4, 95k miles, $22,500
```

Axel creates:
- Instagram post
- Facebook ad copy
- SMS message for known truck buyers

### 2. Buyer Outreach
You:
```
Marcus just bought a Yukon last month. Should we reach out about the new one?
```

Axel:
- Checks Marcus's buying pattern
- Suggests personalized message
- Offers to send it via GHL

### 3. Ad Campaign
You:
```
Create 3 Facebook ad variations for the F-150
```

Axel generates 3 different angles (price, features, reliability) for A/B testing.

---

## Troubleshooting

**Axel doesn't respond:**
- Check bot is invited to channel (`/invite @Axel`)
- Verify tokens are correct in config
- Check `clawdbot gateway status`
- Look at logs: `clawdbot gateway logs`

**Wrong channel:**
- Update `channels.slack.channels` section in config
- Restart gateway

**Need multiple channels:**
```json
"channels": {
  "#wholesale-vehicles": { "allow": true, "agent": "axel" },
  "#deal-machine": { "allow": true, "agent": "axel" }
}
```

---

## Next Steps After Deployment

1. **Connect Go High Level API** - Enable actual SMS/email sending
2. **Import buyer data** - Load historical sales patterns
3. **Test workflows** - Vehicle upload → outreach flow
4. **Create cron jobs** - Weekly inventory summaries, buyer check-ins

---

**Files Created:**
- ✅ `/Users/coreyscruggs/clawd/agents/axel/SOUL.md`
- ✅ `/Users/coreyscruggs/clawd/agents/axel/IDENTITY.md`
- ✅ `/Users/coreyscruggs/clawd/agents/axel/README.md`
- ✅ `/Users/coreyscruggs/clawd/agents/axel/product-marketing-context.md`
- ✅ `/Users/coreyscruggs/clawd/agents/axel/skills/` (7 marketing skills)

**Status:** Ready for deployment when you have Slack tokens.
