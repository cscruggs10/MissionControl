# Deal Machine Quick Reference - Palmer Vehicle Uploads

## Trigger Phrases

When Palmer (Telegram id:8654861772) says ANY of these, follow this workflow:
- "Create Deal Machine listing"
- "Post this vehicle"
- "List the vehicle I just uploaded"
- "Add this to Deal Machine"
- "New vehicle for Deal Machine"
- Any message mentioning uploading/posting a vehicle to Deal Machine

## Step-by-Step Workflow

### 1. Get the Video URL from Mission Control
```bash
cd ~/clawd/mission-control
VIDEO_URL=$(npx convex run messages:listByChannel '{"channelId": "kh79s0d7yt3mbpx9m2dy8f54f582hs33"}' 2>/dev/null | jq -r 'sort_by(._creationTime) | reverse | .[0].mediaUrl')
echo "Video URL: $VIDEO_URL"
```

The URL should look like: `https://res.cloudinary.com/dcpy2x17s/video/upload/v1773767809/deal-machine-uploads/...`

Also get the loop ID:
```bash
LOOP_ID=$(npx convex run loops:listByChannel '{"channelId": "kh79s0d7yt3mbpx9m2dy8f54f582hs33"}' 2>/dev/null | jq -r '[.[] | select(.status == "open")] | sort_by(._creationTime) | reverse | .[0]._id')
echo "Loop ID: $LOOP_ID"
```

### 2. Ask Palmer for 4 Required Fields

**Always ask for ALL 4 - never skip or assume:**

1. **VIN** (17 characters exactly)
2. **Mileage** (number)
3. **Price** (number, no $ or commas)
4. **Condition** (exactly one of):
   - "Deal Machine Certified"
   - "Auction Certified"

If VIN is too short/long, ask them to verify and resend.

### 3. Decode VIN to Get Make/Model/Year

```bash
curl -s "https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/{VIN}?format=json" | jq -r '.Results[] | select(.Variable == "Make" or .Variable == "Model" or .Variable == "Model Year") | "\(.Variable): \(.Value)"'
```

### 4. Create Vehicle Listing

```bash
curl -s -X POST "https://www.dealerdealmachine.com/api/vehicles" \
  -H "Content-Type: application/json" \
  -d "{
    \"vin\": \"VIN_HERE\",
    \"mileage\": MILEAGE_NUMBER,
    \"price\": PRICE_NUMBER,
    \"condition\": \"CONDITION_HERE\",
    \"videos\": [\"$VIDEO_URL\"]
  }" | jq '.'
```

**Save the vehicle ID from the response!**

### 5. Update to Active Status

```bash
curl -s -X PATCH "https://www.dealerdealmachine.com/api/vehicles/{VEHICLE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "mileage": MILEAGE_NUMBER,
    "price": PRICE_NUMBER,
    "condition": "CONDITION_HERE",
    "status": "active"
  }' | jq '.'
```

### 6. Close the Loop

```bash
cd ~/clawd/mission-control
npx convex run loops:close "{\"id\": \"$LOOP_ID\"}"
```

### 7. Notify Palmer

```
✅ Listing created successfully!

**YEAR MAKE MODEL TRIM**
- VIN: {VIN}
- Mileage: {MILEAGE} miles
- Price: ${PRICE}
- Condition: {CONDITION}
- Status: Active & In Queue

🔗 View at: https://www.dealerdealmachine.com/vehicles/{VEHICLE_ID}
```

## Common Issues

### VIN Wrong Length
If VIN is not exactly 17 characters, tell Palmer:
> The VIN needs to be exactly 17 characters. You provided {X} characters. Please double-check and resend the complete VIN.

### Video Not Showing
Check that `$VIDEO_URL` is a Cloudinary URL (starts with `https://res.cloudinary.com/`).
If it's a local path like `/uploads/...`, the video won't display.

### Missing Fields
Never proceed without all 4 fields. Always ask explicitly.

## Access Control Reminder

Palmer (id:8654861772) has LIMITED access:
- ✅ Vehicle uploads to Deal Machine
- ✅ Price changes on existing listings
- ❌ Task management
- ❌ Mission Control access
- ❌ System changes
- ❌ General questions

## Example Session

**Palmer:** "Please post video to Deal Machine that I just uploaded"

**You:** "I see your video upload. To create the listing, I need:
1. VIN (17 characters)
2. Mileage
3. Price
4. Condition (Deal Machine Certified OR Auction Certified)"

**Palmer:** "VIN 1HGCV1F47NA014222"
**You:** "Got it. Now I need: mileage, price, and condition."

**Palmer:** "Mileage 126285"
**You:** "Perfect. Now: price and condition."

**Palmer:** "Auction certified"
**You:** "Got it. Last piece: price."

**Palmer:** "Price 15500"
**You:** [Execute workflow, create listing, close loop, notify]

---

**Remember:** Read this file EVERY TIME Palmer uploads. Don't skip steps!
