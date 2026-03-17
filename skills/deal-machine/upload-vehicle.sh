#!/bin/bash
# Deal Machine Vehicle Upload Script
# Usage: ./upload-vehicle.sh VIN MILEAGE PRICE "CONDITION" VIDEO_FILENAME LOOP_ID

set -e

VIN="$1"
MILEAGE="$2"
PRICE="$3"
CONDITION="$4"
VIDEO="$5"
LOOP_ID="$6"

if [ -z "$VIN" ] || [ -z "$MILEAGE" ] || [ -z "$PRICE" ] || [ -z "$CONDITION" ] || [ -z "$VIDEO" ]; then
  echo "Usage: $0 VIN MILEAGE PRICE \"CONDITION\" VIDEO_FILENAME [LOOP_ID]"
  echo ""
  echo "Example:"
  echo "  $0 1HGCV1F47NA014222 126289 15500 \"Auction Certified\" 1000017493.mp4 kn7d97e0ss3zy80hwchzzpcx6h8334f8"
  exit 1
fi

# Validate VIN length
if [ ${#VIN} -ne 17 ]; then
  echo "❌ Error: VIN must be exactly 17 characters (provided: ${#VIN})"
  exit 1
fi

echo "🔍 Decoding VIN: $VIN"
VEHICLE_INFO=$(curl -s "https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/$VIN?format=json" | jq -r '.Results[] | select(.Variable == "Make" or .Variable == "Model" or .Variable == "Model Year") | "\(.Variable): \(.Value)"')
echo "$VEHICLE_INFO"

echo ""
echo "📝 Creating initial vehicle record..."
RESPONSE=$(curl -s -X POST "https://www.dealerdealmachine.com/api/vehicles" \
  -H "Content-Type: application/json" \
  -d "{
    \"vin\": \"$VIN\",
    \"mileage\": $MILEAGE,
    \"price\": $PRICE,
    \"condition\": \"$CONDITION\",
    \"videos\": [\"/uploads/$VIDEO\"]
  }")

VEHICLE_ID=$(echo "$RESPONSE" | jq -r '.id')
echo "✅ Vehicle created with ID: $VEHICLE_ID"

echo ""
echo "🔄 Updating to active status..."
curl -s -X PATCH "https://www.dealerdealmachine.com/api/vehicles/$VEHICLE_ID" \
  -H "Content-Type: application/json" \
  -d "{
    \"mileage\": $MILEAGE,
    \"price\": $PRICE,
    \"condition\": \"$CONDITION\",
    \"status\": \"active\"
  }" | jq '.'

echo ""
echo "✅ Listing created successfully!"
echo ""
echo "🔗 View at: https://www.dealerdealmachine.com/vehicles/$VEHICLE_ID"

if [ -n "$LOOP_ID" ]; then
  echo ""
  echo "🔄 Closing Mission Control loop..."
  cd ~/clawd/mission-control
  npx convex run loops:close "{\"id\": \"$LOOP_ID\"}" 2>/dev/null
  echo "✅ Loop closed"
fi
