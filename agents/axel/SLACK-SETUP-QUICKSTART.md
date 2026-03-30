# Axel Slack Setup - Quick Reference

## What You Need

1. **Slack Bot Token** (starts with `xoxb-...`)
2. **Slack App Token** (starts with `xapp-...`)
3. **Channel name** (e.g., `#wholesale-vehicles`)

---

## Get Tokens (5 minutes)

1. Go to https://api.slack.com/apps
2. Create app **OR** use existing
3. **Socket Mode** → Generate token → Copy `xapp-...`
4. **OAuth & Permissions** → Install app → Copy `xoxb-...`
5. Invite bot to channel: `/invite @Axel`

---

## Deploy Axel (1 command)

```bash
clawdbot gateway config.patch --raw '{
  "agents": {
    "list": [
      {
        "id": "axel",
        "name": "Axel",
        "workspace": "/Users/coreyscruggs/clawd/agents/axel",
        "model": { "primary": "anthropic/claude-sonnet-4-5" },
        "emoji": "🚗"
      }
    ]
  },
  "channels": {
    "slack": {
      "enabled": true,
      "botToken": "xoxb-YOUR-TOKEN-HERE",
      "appToken": "xapp-YOUR-TOKEN-HERE",
      "groupPolicy": "allowlist",
      "channels": {
        "#wholesale-vehicles": {
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
- `xoxb-YOUR-TOKEN-HERE` with your bot token
- `xapp-YOUR-TOKEN-HERE` with your app token
- `#wholesale-vehicles` with your channel name

---

## Restart

```bash
clawdbot gateway restart
```

---

## Test

In Slack channel:
```
Create a Facebook post for: 2016 Yukon, 145k miles, $15,775
```

Axel should respond with marketing copy.

---

## Done! 🚗

See `DEPLOYMENT.md` for full details and troubleshooting.
