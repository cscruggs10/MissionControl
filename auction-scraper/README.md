# Auction Intel

**Goal:** Pull announcement data from auction sites → database → query by buying signals

## Features ✅

- **Web UI** - Drag-and-drop CSV upload with auction name and date
- **AutoNiq Scraper** - Extract announcement data via browser relay
- **PostgreSQL Storage** - Structured data with deduplication
- **Rate Limiting** - 3-8 sec delays to avoid bot detection
- **Progress Tracking** - Real-time scraping status

## Quick Start

### 1. Setup Database (First Time Only)
```bash
cd /root/clawd/auction-scraper
./setup-db.sh
```

### 2. Start Web Server
```bash
npm start
```

Server runs on: http://localhost:3000

### 3. Upload Runlist
1. Open browser to http://localhost:3000
2. Drag CSV file or click to browse
3. Enter auction name (e.g., "United Auto Exchange Memphis")
4. Select runlist date
5. Click "Start Scraping"

### 4. Browser Relay Required
- Open AutoNiq in Chrome
- Click the Clawdbot Browser Relay toolbar icon
- Keep tab open while scraping runs

## CLI Usage (Alternative)

```bash
node autoniq-scraper.js <runlist.csv> "<Auction Name> (YYYY-MM-DD)"
```

Example:
```bash
node autoniq-scraper.js test-runlist.csv "United Auto Exchange Memphis (2026-01-29)"
```

## Data Source: AutoNiq

**Announcement Format:**
```
United Auto Exchange Memphis
Thu, Jan 29 at 12:30PM CST
9:0546, Grade: 1.0 AS IS; INOP; TMU
```

**Extraction Pattern:**
- VIN → Direct URL: `autoniq.com/app/evaluator/vin/{VIN}`
- Grade: Float value (e.g., 1.0, 2.5)
- Announcements: Pipe-delimited (e.g., "AS IS|INOP|TMU")

**Bot Detection Mitigation:**
- Browser relay (uses your existing Chrome session)
- Random delays (3-8 seconds between requests)
- Manual runs only (no automation)

## Structure

- `server.js` - Web server + upload handler
- `autoniq-scraper.js` - AutoNiq scraper with browser relay
- `scraper.js` - Core scraping/storage logic
- `parse-announcements.js` - Announcement parser
- `setup-db.sh` - Database initialization
- `schema.sql` - PostgreSQL schema
- `../public/index.html` - Web UI

## Database

**Connection:**
- Database: `auction_data`
- User: `auction_user`
- Password: `auction_pass`
- Host: `localhost:5432`

**Tables:**
- `vehicles` - VIN, auction, grade, raw announcements
- `announcement_types` - Catalog of announcement types
- `vehicle_announcements` - Many-to-many linking table
