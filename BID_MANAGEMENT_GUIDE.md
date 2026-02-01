# Bid Management System - Implementation Guide

## What Was Built

We've implemented a complete bid management system for AutoIntel that allows you to:
1. Browse vehicles in runlists (research)
2. Add vehicles to In-Lane bid list (manual bidding)
3. Add vehicles to Proxy bid list (automated max bid)
4. Mark vehicles as "Pass"
5. View organized dashboards grouped by auction

## Database Schema

### New Tables Created

**`users` table:**
- Multi-user support
- Default user created automatically

**`bid_list` table:**
- Tracks all bid decisions (in-lane, proxy, pass)
- User-specific and auction-scoped
- Enforces mutual exclusivity (one decision per vehicle)
- Stores max_bid for proxy bids
- Tracks who added each bid (attribution)

### Key Features:
- **Unique constraint**: One user can only have one bid type per vehicle per auction
- **Automatic swap**: Changing from proxy to in-lane automatically updates the record
- **Attribution**: Every bid tracks which user added it

## API Endpoints

### Bid List Management

**Add/Update Bid:**
```bash
POST /api/bid-list/add
Content-Type: application/json

{
  "vehicle_id": 1,
  "auction_id": 1,
  "bid_type": "in-lane",  # or "proxy" or "pass"
  "max_bid": 15000        # required for proxy, null otherwise
}
```

**Remove Bid:**
```bash
DELETE /api/bid-list/:id
```

**Get Bid Status for Runlist:**
```bash
GET /api/bid-list/runlist/:runlist_id

Returns: Map of vehicle_id -> bid info
```

**In-Lane Dashboard:**
```bash
GET /api/bid-list/in-lane-dashboard

Returns: Grouped by auction, sorted by lane/run number
```

**Proxy Dashboard:**
```bash
GET /api/bid-list/proxy-dashboard

Returns: Grouped by auction, sorted by lane/run number, includes max_bid
```

## User Interface

### New Page: `/autointel`

A completely redesigned interface with:

1. **Sidebar Navigation:**
   - Dashboard (overview stats)
   - AutoIntel Calendar (runlist browsing with bid actions)
   - In-Lane Bids (your manual bid list)
   - Proxy Bids (your automated bid list)

2. **AutoIntel Calendar Page:**
   - View all runlists organized by auction date
   - See enriched vehicle data (Year, Make, Model, VIN, Lane, etc.)
   - Quick action buttons on each vehicle:
     - "+ In-Lane" - Add to manual bid list
     - "+ Proxy" - Add to proxy list (prompts for max bid)
     - "Pass" - Mark as not interested
   - Status badges show current bid type and who added it

3. **In-Lane Dashboard:**
   - All your in-lane bids grouped by auction
   - Sorted by lane/run number within each auction
   - Shows: Lane, Run#, Year, Make, Model, Trim, Miles, VIN, CR, Announcements
   - Remove button on each vehicle

4. **Proxy Dashboard:**
   - Same structure as in-lane
   - Additionally shows Max Bid amount for each vehicle
   - Remove button on each vehicle

## How to Use

### Research & Add Vehicles

1. Navigate to "AutoIntel Calendar"
2. Browse through auctions and their runlists
3. For each vehicle you're interested in:
   - Click "+ In-Lane" to add to your manual bid list
   - Click "+ Proxy" to set an automated max bid
   - Click "Pass" to mark as not interested

4. Status badges appear immediately showing your decision

### Manage Your Bids

**In-Lane Dashboard:**
- View all vehicles you plan to bid on manually
- Organized by auction and run order
- Perfect as your "dashboard" during live bidding

**Proxy Dashboard:**
- View all vehicles with automated max bids
- Review and adjust max bids
- See everything organized by auction

### Change Your Mind

- Click the opposite bid type button to automatically swap
- Example: If marked as "Proxy", clicking "+ In-Lane" will change it
- Or remove the bid entirely from the dashboard pages

## Testing

All endpoints are working and tested:

```bash
# Test API status
curl http://localhost:3000/api/status

# Test adding in-lane bid
curl -X POST http://localhost:3000/api/bid-list/add \
  -H "Content-Type: application/json" \
  -d '{"vehicle_id": 1, "auction_id": 1, "bid_type": "in-lane"}'

# Test adding proxy bid
curl -X POST http://localhost:3000/api/bid-list/add \
  -H "Content-Type: application/json" \
  -d '{"vehicle_id": 2, "auction_id": 1, "bid_type": "proxy", "max_bid": 15000}'

# Test dashboards
curl http://localhost:3000/api/bid-list/in-lane-dashboard
curl http://localhost:3000/api/bid-list/proxy-dashboard
```

## Files Created/Modified

### New Files:
- `/root/clawd/database/migrations/001_create_users_and_bid_list.sql` - Database schema
- `/root/clawd/routes/bid-list.js` - API endpoints
- `/root/clawd/public/autointel.html` - New UI with sidebar navigation

### Modified Files:
- `/root/clawd/server.js` - Added bid-list routes and /autointel page route

## Next Steps

This Phase 1 implementation provides:
✅ Runlist research/browsing
✅ Quick action buttons to add to lists
✅ In-Lane and Proxy dashboards
✅ Pass marking
✅ User attribution
✅ Multi-user support foundation

**What comes later (as discussed):**
- Proxy bid max amount configuration UI
- Bulk operations
- Real-time bidding integration
- Bid execution logic

## Access the New Interface

1. Server is running on port 3000
2. Visit: http://localhost:3000/autointel
3. Or keep using the original upload interface at: http://localhost:3000/

## Current State

The system is fully functional with:
- 2 runlists in the database
- Sample vehicles loaded
- Test bids created (1 in-lane, 1 proxy)
- All API endpoints working
- UI rendering correctly

You can now browse runlists, add vehicles to your bid lists, and manage them through the dedicated dashboards!
