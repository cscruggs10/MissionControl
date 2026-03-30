# Axel - Wholesale Vehicle Sales Agent

**Role:** Drive sales for Deal Machine by matching inventory to buyers using data intelligence and multi-channel outreach.

## What Axel Does

### 1. Smart Buyer Matching
- Analyzes buyer purchase history and patterns
- Identifies best prospects for each vehicle
- Predicts buying frequency and preferences
- Segments buyers by type (Regular, Flipper, Volume, Specialist)

### 2. Multi-Channel Outreach
- **SMS** (via Go High Level) - Direct, immediate contact
- **Email** (via GHL) - Detailed specs and photos
- **Social Media** - Facebook/Instagram posts and ads
- **Follow-up Sequences** - Automated but personalized

### 3. Content Creation
- Vehicle descriptions and copy
- Social media posts (Instagram/Facebook)
- Ad creative variations for testing
- Email sequences and SMS messages

### 4. Performance Tracking
- Monitors buyer engagement and response rates
- Tracks inventory performance (days on market)
- Analyzes which channels work best
- Updates buyer profiles based on behavior

## How to Work With Axel

### When a Vehicle Uploads
Axel automatically:
1. Analyzes the vehicle specs
2. Checks buyer database for matches
3. Creates targeted outreach plan
4. Sends personalized messages
5. Posts to social media if appropriate
6. Logs all activity in GHL

### Manual Requests
You can ask Axel to:
- "Create a Facebook post for the 2016 Yukon"
- "Send SMS to Marcus about the F-150"
- "Write an email sequence for truck buyers"
- "Which dealers should we reach out to for this vehicle?"
- "Create 3 ad variations for Instagram"

### Reporting
Ask Axel for:
- "Show me buyer patterns for Marcus"
- "What vehicles sell fastest?"
- "Who hasn't bought in 3+ months?"
- "Response rate analysis by channel"

## Skills

Axel uses these marketing skills (coreyhaines31/marketingskills):

1. **email-sequence** - Follow-up campaigns, re-engagement
2. **copywriting** - Vehicle descriptions, compelling copy
3. **social-content** - Instagram/Facebook posts
4. **ad-creative** - Multiple ad variations for testing
5. **marketing-psychology** - Urgency, scarcity, social proof
6. **analytics-tracking** - Buyer patterns, inventory performance
7. **product-marketing-context** - Buyer personas, preferences

## Integration Points

**Go High Level:**
- Contact management
- SMS/Email sending
- Pipeline tracking
- Task creation
- Automation triggers

**Custom Intelligence DB:**
- Sales history by dealer
- Buyer preference patterns
- Engagement metrics
- Predictive analytics

**Deal Machine:**
- Vehicle listings (via Wheeljack)
- Inventory status
- Pricing data

**Social Media:**
- Facebook page API
- Instagram Business API
- Ad campaign management

## Voice & Tone

Axel talks like a real wholesaler:

✅ "Hey Marcus, got a Yukon for you"  
✅ "Still available if you want it. Couple other guys asking about it"  
✅ "Been a minute. You still in the market or taking a break?"

❌ "Hello Marcus, I hope this message finds you well..."  
❌ "Please be advised that this vehicle remains in our inventory..."

## Example Workflows

### New Vehicle Workflow
```
1. Palmer uploads vehicle video
2. Loop created in Mission Control
3. Axel receives notification
4. Analyzes: 2016 GMC Yukon, 145k miles, $15,775
5. Checks DB: Marcus bought 2 Yukons in last 6 months
6. Pulls Marcus's contact from GHL
7. Sends SMS: "Hey Marcus, got a Yukon for you"
8. Logs interaction in GHL
9. Sets follow-up task if no response
```

### Social Media Workflow
```
1. Axel reviews new inventory
2. Identifies vehicles for social promotion
3. Creates Instagram Story + Facebook post
4. Schedules posting
5. Monitors engagement
6. Responds to comments/DMs
```

### Re-Engagement Workflow
```
1. Axel identifies inactive buyers (3+ months)
2. Segments by past preferences
3. Sends personalized "checking in" message
4. Updates buyer status based on response
5. Adds to appropriate follow-up sequence
```

## Metrics

**Speed:**
- Upload to first outreach: <30 min
- Response to dealer inquiries: <5 min

**Quality:**
- Match accuracy (right vehicle → right dealer)
- Response rate by channel
- Conversion rate (inquiry → sale)

**Volume:**
- Vehicles sold per week
- Average days on market
- Revenue per vehicle

## Files

- **SOUL.md** - Personality, mission, voice
- **IDENTITY.md** - Name, vibe, emoji
- **product-marketing-context.md** - Buyer personas, market context
- **skills/** - 7 marketing skills from coreyhaines31
- **README.md** - This file

## Future Enhancements

**Phase 2:**
- Automated ad campaign creation
- Dynamic pricing recommendations
- Predictive inventory needs ("We should stock more F-150s")
- Cross-sell to Ajax Partners clients (captive insurance for dealers)

**Phase 3:**
- Voice calling capability
- Video message creation
- Market trend analysis
- Competitive intelligence

---

**Built:** March 24, 2026  
**Status:** Ready for deployment  
**Next Steps:** Connect to Go High Level API, test outreach workflows
