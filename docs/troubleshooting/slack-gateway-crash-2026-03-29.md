# Slack Integration Gateway Crash - March 29, 2026

## What Happened
- Added Slack channel integration with socket mode enabled
- Gateway crashed immediately and went into restart loop for 3 days
- Telegram went offline as collateral damage (entire gateway down)
- Fixed by disabling Slack in config

## Root Cause
When Slack was enabled with `mode: "socket"`, the gateway attempted to establish a WebSocket connection but failed (likely invalid/expired credentials or connection error). The gateway didn't gracefully handle the failure and crashed the entire process.

Since all channels (Telegram, Slack, iMessage, etc.) run through the same gateway process:
- One bad channel = entire gateway down
- All channels went offline, not just Slack

## The Fix
Set Slack `enabled: false` in `~/.openclaw/openclaw.json`:

```json
"slack": {
  "mode": "socket",
  "enabled": false,  // Changed from true
  // ... rest of config
}
```

Gateway restarted cleanly, Telegram came back online.

## Config Timeline (from backups)
- `.bak.3` (March 29 ~1:04pm): Slack `enabled: true` - gateway crashing
- `.bak.2` (March 29 ~1:40pm): Slack `enabled: false` - gateway stabilized
- Current: Slack remains disabled

## How to Safely Add Slack Again

### Option 1: Test in Foreground (Recommended)
1. **Verify credentials first:**
   ```bash
   # Test bot token
   curl -X POST https://slack.com/api/auth.test \
     -H "Authorization: Bearer <bot-token>"
   
   # Test app token
   curl -X POST https://slack.com/api/auth.test \
     -H "Authorization: Bearer <app-token>"
   ```

2. **Stop service and run in foreground:**
   ```bash
   openclaw gateway stop
   openclaw gateway --log-level debug
   ```

3. **Enable Slack in config, watch logs**
   - If crashes, see error immediately (can Ctrl+C)
   - If stable for 30+ seconds, restart as service

### Option 2: Use Webhook Mode
Socket mode maintains persistent connection (more crash-prone).
Webhook mode is simpler:

```json
"slack": {
  "mode": "webhook",  // Instead of "socket"
  "enabled": true,
  // Requires exposing webhook endpoint
}
```

### Option 3: Wait for Better Error Handling
File issue with OpenClaw devs - gateway should gracefully handle failed channel connections, not crash entire process.

## Lessons Learned
1. **Single point of failure**: One bad channel config crashes all channels
2. **Test credentials first**: Validate tokens before enabling in live config
3. **Test in foreground**: Don't enable new channels in production without watching logs
4. **Keep backups**: Config backups saved us (`.bak.2` showed when we disabled Slack)
5. **No logs = blind troubleshooting**: No logs from the 3-day outage period (March 26-28)

## Prevention
- Always test new channel integrations in foreground mode first
- Keep config backups (OpenClaw does this automatically)
- Monitor gateway status after config changes
- Consider running gateway with `--log-level debug` initially when testing new features
