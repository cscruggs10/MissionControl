# Deal Machine Upload System

## Overview
Simple upload page for field workers to upload vehicle videos that automatically creates listings and social content.

## How It Works

### 1. Field Worker Flow
1. Open: **http://134.199.192.218:3000/deal-machine-upload**
2. Click to upload vehicle video (up to 500MB supported)
3. Video automatically uploads to Cloudinary
4. Loop created in Mission Control `#deal-machine` channel
5. Done! Agents handle the rest.

### 2. What Needs to Be in the Video
**All vehicle info must be visible/audible:**
- VIN number
- Year, Make, Model, Trim
- Mileage
- Price
- Condition (any damage, notes)
- Key features

### 3. Agent Workflow (Automatic)

**@Wheeljack** (CMO - Deal Machine):
- Watches video
- Extracts vehicle info (VIN, mileage, price, etc.)
- Creates listing in Deal Machine app
- Posts to database

**@Jazz** (Designer):
- Edits video for social media
- Creates 2 versions:
  - 1:1 square for Instagram feed
  - 9:16 vertical for Reels/Stories
- Adds captions, music if needed
- Delivers to Skyfire

**@Skyfire** (Social Media):
- Posts video to Facebook
- Posts video to Instagram
- Uses hashtags: #usedcars #dealsonwheels #memphiscars (customize as needed)

## Technical Details

### Upload Limits
- **Max file size:** 500MB (configurable)
- **Supported formats:** All video formats (MP4, MOV, AVI, etc.)
- **Upload destination:** Cloudinary (`deal-machine-uploads` folder)

### Channel Structure
- **Channel:** `#deal-machine` (kh79s0d7yt3mbpx9m2dy8f54f582hs33)
- **Loop naming:** "Vehicle: [filename]"
- **Auto-assigned:** Wheeljack, Jazz, Skyfire

### API Endpoints
- `/api/cloudinary-sign` - Generates upload signature
- `/api/create-deal-machine-loop` - Creates loop with video

### Code Structure
```
mission-control/
├── app/
│   ├── deal-machine-upload/
│   │   └── page.tsx          # Upload UI
│   └── api/
│       ├── cloudinary-sign/
│       │   └── route.ts       # Cloudinary signature
│       └── create-deal-machine-loop/
│           └── route.ts       # Loop creation + agent assignment
```

## Mobile Access
The upload page is fully mobile-responsive. Field workers can:
- Use their phones in the field
- Upload directly from camera roll
- No app installation needed
- Works on iPhone and Android

## Monitoring
Check loop status in Mission Control:
- View at: http://134.199.192.218:3000
- Navigate to `#deal-machine` channel
- See real-time updates from agents

## Deal Machine Integration
The system integrates with Deal Machine at:
- **Repo:** `/Users/coreyscruggs/clawd/NewDealMachineRepo`
- **GitHub:** https://github.com/cscruggs10/NewDealMachineRepo
- **Schema:** `shared/schema.ts` (vehicles table)

### Vehicle Fields Posted
```typescript
{
  vin: string,
  make: string,
  model: string,
  trim: string,
  year: number,
  mileage: number,
  price: string,
  description: string,
  condition: string,
  videos: string[],           // Array of Cloudinary URLs
  videoThumbnails: string[],  // Cloudinary thumbnails
  status: 'active',
  inQueue: true
}
```

## Troubleshooting

### Upload Fails
- Check file size (must be < 500MB)
- Verify video format is supported
- Check Cloudinary credentials in `.env.local`

### Loop Not Created
- Verify #deal-machine channel exists
- Check agents (Wheeljack, Jazz, Skyfire) are active
- Check Convex connection

### Agents Not Responding
- Check agent heartbeat schedule
- Verify agents are subscribed to #deal-machine
- Check Mission Control logs

## Future Enhancements
- [ ] QR code for easy phone access
- [ ] SMS link for field workers
- [ ] Auto-extract VIN using OCR
- [ ] Voice notes for additional context
- [ ] Bulk upload support (multiple vehicles)
