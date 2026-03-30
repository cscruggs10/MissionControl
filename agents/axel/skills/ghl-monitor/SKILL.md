# Go High Level Message Monitor - Draft & Approve

## Purpose
Monitor GHL conversations for new dealer inquiries and draft responses for approval.

## How It Works

### 1. Load Credentials
```bash
API_KEY=$(cat /Users/coreyscruggs/clawd/.credentials/gohighlevel.json | jq -r '.apiKey')
LOCATION_ID="VmfxSFvGeB2kXGGxuDIB"  # Dealer Deal Machine
```

### 2. Get Recent Conversations
```bash
curl -X GET "https://services.leadconnectorhq.com/conversations/search?locationId=${LOCATION_ID}&limit=20" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Version: 2021-07-28"
```

### 3. Check Each Conversation for New Messages
```bash
# For each conversation ID
curl -X GET "https://services.leadconnectorhq.com/conversations/${CONVERSATION_ID}/messages" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Version: 2021-07-28"
```

### 4. Identify Unprocessed Inbound Messages
- Filter: `direction="inbound"`
- Check timestamp: last 15 minutes
- Track processed messages in state file: `/Users/coreyscruggs/clawd/agents/axel/.processed-messages.json`

### 5. Get Dealer Context
```bash
# For each new message, get contact info
curl -X GET "https://services.leadconnectorhq.com/contacts/${CONTACT_ID}" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Version: 2021-07-28"
```

### 6. Draft Response
- Analyze dealer's question
- Check message history for context
- Look at dealer tags (e.g., "independent sub prime")
- Draft appropriate response using Axel's voice

### 7. Post to Mission Control
```bash
cd /Users/coreyscruggs/clawd/mission-control

# Create approval task
npx convex run tasks:create '{
  "title": "Approve response to [dealer name]",
  "description": "**Dealer:** [name] ([company])\n**Their message:** [message]\n\n**Draft response:**\n[your drafted response]\n\n---\nReply \"send\" to approve, or edit the response and reply \"send [edited text]\"",
  "assigneeIds": ["j976w9zxtj42rwz3w64my2dfh180v9p1"]
}'
```

### 8. Wait for Approval
- Check task comments on next heartbeat
- Look for "send" or "approved" command
- If edited, use edited version

### 9. Send Approved Message
```bash
curl -X POST "https://services.leadconnectorhq.com/conversations/messages" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -H "Version: 2021-07-28" \
  -d '{
    "type": "SMS",
    "contactId": "'${CONTACT_ID}'",
    "message": "'${APPROVED_MESSAGE}'"
  }'
```

### 10. Mark Complete
- Add message ID to processed list
- Complete task in Mission Control
- Add note to dealer record in GHL

## State Tracking

**File:** `/Users/coreyscruggs/clawd/agents/axel/.processed-messages.json`

```json
{
  "processedMessages": [
    {
      "messageId": "ABC123",
      "conversationId": "XYZ789",
      "processedAt": "2026-03-29T20:30:00-05:00",
      "status": "sent",
      "taskId": "j97..."
    }
  ]
}
```

## Approval Commands

**In Mission Control task comments:**
- `send` → Send as drafted
- `send [new text]` → Send edited version
- `cancel` → Don't send, mark complete
- `edit: [changes]` → Update draft, keep task open

## Safety Rules

1. **Never send without approval** - Always post to Mission Control first
2. **Track everything** - Log all processed messages
3. **Preserve context** - Include full conversation history in approval request
4. **Respect opt-outs** - Never message contacts with DND status
5. **One response per inquiry** - Don't double-message
