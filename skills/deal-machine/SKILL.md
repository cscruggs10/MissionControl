# Deal Machine Vehicle Upload Skill

## Purpose
Upload vehicle listings to Deal Machine (www.dealerdealmachine.com) from video uploads in Mission Control.

## When to Use
- Palmer (Telegram id:8654861772) uploads a vehicle video
- Loop created in #deal-machine channel with video attachment
- Need to create active listing on Deal Machine website

## Prerequisites
- Deal Machine API URL: `https://www.dealerdealmachine.com`
- Mission Control loop with vehicle video attached
- NHTSA VIN decoder API (free, no auth required)

## Required Information from User
Always ask the user for ALL of these fields:

1. **VIN** (17 characters exactly)
2. **Mileage** (odometer reading)
3. **Price** (asking price in dollars)
4. **Condition** (exactly one of):
   - "Deal Machine Certified"
   - "Auction Certified"

⚠️ **IMPORTANT:** Never assume or skip any field. Always ask explicitly.

## Workflow

### Step 1: Validate VIN
```bash
# VIN must be exactly 17 characters
# If user provides shorter VIN, ask them to verify and resend
```

### Step 2: Decode VIN (Get Make/Model/Year)
```bash
curl -s "https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/{VIN}?format=json" \
  | jq -r '.Results[] | select(.Variable == "Make" or .Variable == "Model" or .Variable == "Model Year") | "\(.Variable): \(.Value)"'
```

**Example:**
```bash
curl -s "https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/1HGCV1F47NA014222?format=json" \
  | jq -r '.Results[] | select(.Variable == "Make" or .Variable == "Model" or .Variable == "Model Year") | "\(.Variable): \(.Value)"'

# Returns:
# Make: HONDA
# Model: Accord
# Model Year: 2022
```

### Step 3: Create Initial Vehicle Record
```bash
curl -X POST "https://www.dealerdealmachine.com/api/vehicles" \
  -H "Content-Type: application/json" \
  -d '{
    "vin": "VIN_HERE",
    "mileage": MILEAGE_NUMBER,
    "price": PRICE_NUMBER,
    "condition": "CONDITION_HERE",
    "videos": ["/uploads/VIDEO_FILENAME.mp4"]
  }'
```

**Note:** This creates the vehicle but may return status "pending" with null fields.

### Step 4: Update Vehicle to Active Status
```bash
# Extract the vehicle ID from the POST response (e.g., "id": 96)
# Then update it:

curl -X PATCH "https://www.dealerdealmachine.com/api/vehicles/{VEHICLE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "mileage": MILEAGE_NUMBER,
    "price": PRICE_NUMBER,
    "condition": "CONDITION_HERE",
    "status": "active"
  }'
```

### Step 5: Close Mission Control Loop
```bash
cd ~/clawd/mission-control
npx convex run loops:close '{"id": "LOOP_ID_HERE"}'
```

### Step 6: Notify User
Respond with:
```
✅ Listing created successfully!

**YEAR MAKE MODEL TRIM**
- VIN: VIN_HERE
- Mileage: MILEAGE miles
- Price: $PRICE
- Condition: CONDITION
- Status: Active & In Queue

View it at: https://www.dealerdealmachine.com/vehicles/VEHICLE_ID
```

## Complete Example

**User provides:**
- VIN: 1HGCV1F47NA014222
- Mileage: 126,289
- Price: $15,500
- Condition: Auction Certified
- Video: 1000017493.mp4

**Commands:**
```bash
# 1. Decode VIN
curl -s "https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/1HGCV1F47NA014222?format=json" \
  | jq -r '.Results[] | select(.Variable == "Make" or .Variable == "Model" or .Variable == "Model Year") | "\(.Variable): \(.Value)"'

# 2. Create vehicle
curl -X POST "https://www.dealerdealmachine.com/api/vehicles" \
  -H "Content-Type: application/json" \
  -d '{
    "vin": "1HGCV1F47NA014222",
    "mileage": 126289,
    "price": 15500,
    "condition": "Auction Certified",
    "videos": ["/uploads/1000017493.mp4"]
  }'
# Returns: {"id": 96, ...}

# 3. Update to active
curl -X PATCH "https://www.dealerdealmachine.com/api/vehicles/96" \
  -H "Content-Type: application/json" \
  -d '{
    "mileage": 126289,
    "price": 15500,
    "condition": "Auction Certified",
    "status": "active"
  }'

# 4. Close loop
cd ~/clawd/mission-control
npx convex run loops:close '{"id": "kn7d97e0ss3zy80hwchzzpcx6h8334f8"}'
```

## Error Handling

### VIN Too Short
```json
{"message": "Please enter the full 17-character VIN"}
```
**Action:** Ask user to verify and resend complete VIN.

### Invalid Condition
Must be exactly:
- "Deal Machine Certified"
- "Auction Certified"

### Missing Required Fields
Never proceed without all 4 fields (VIN, mileage, price, condition).

## Access Control
⚠️ **Palmer (id:8654861772) ONLY has access to:**
- Vehicle uploads
- Price changes on existing listings
- Deal Machine listing status checks

**Block Palmer from:**
- Task management
- Mission Control access
- General questions
- System changes
- Other agent coordination

## Notes
- VIN decoder is free and requires no API key
- Deal Machine API has no auth currently (may change in production)
- Video files are referenced by filename from Mission Control uploads
- Status "active" + "inQueue: true" means listing is live and ready
- Vehicle ID is auto-incremented by database

## Future Improvements
- [ ] Auto-extract VIN from video using vision AI
- [ ] Auto-extract mileage from odometer reading in video
- [ ] Parse spoken price/condition from video audio transcription
- [ ] Validate VIN checksum digit
- [ ] Add video thumbnail generation

## Changelog
- 2026-03-17: Initial skill created after successful Palmer listing (Vehicle ID 96)
