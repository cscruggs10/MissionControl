# Vehicle Procurement Workflow - Development Spec

## Overview
Auto Intel is a **vehicle procurement tool** that helps buyers identify, research, and acquire vehicles from auto auctions. The workflow moves from data ingestion → enrichment → research → bidding strategy execution.

---

## Core Workflow

```
1. Upload Runlist → 2. Filter → 3. Enrich (AutoNiq) → 4. Calendar View → 5. Research → 6. Mark Strategy → 7. Execute
```

---

## PART 1: Data Ingestion & Filtering

### 1.1 Runlist Upload

**Supported Formats:**
- Excel (.xlsx, .xls)
- CSV
- PDF (OCR extraction)
- Direct API from auction houses (Manheim, ADESA, etc.)

**Core Vehicle Data:**
```typescript
interface RawVehicle {
  lotNumber: string;
  vin?: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage: number;
  color?: string;
  transmission?: string;
  engine?: string;
  condition?: string;
  announcements?: string[];
  seller?: string;
  location: string;
  auctionDate: Date;
  auctionTime?: string;
  estimatedValue?: number;
}
```

### 1.2 Initial Filtering

**Filter Categories:**

**Price Range:**
- Min/Max price
- Below/Above book value %
- Target profit margin

**Vehicle Specs:**
- Year range (e.g., 2018-2023)
- Make/Model (multi-select)
- Mileage max (e.g., <75k miles)
- Body type (sedan, SUV, truck, etc.)
- Drivetrain (FWD, AWD, 4WD)
- Transmission (auto, manual)
- Fuel type (gas, diesel, hybrid, electric)

**Condition:**
- Title status (clean, salvage, rebuilt, etc.)
- Condition grade (1-5)
- Damage level
- Runs/Drives status

**Auction Details:**
- Auction house
- Location/lane
- Sale date range
- Seller type (dealer, bank, rental, etc.)

**UI Component:**
```typescript
interface FilterPanel {
  priceRange: [number, number];
  yearRange: [number, number];
  mileageMax: number;
  makes: string[];
  models: string[];
  bodyTypes: string[];
  titleStatus: string[];
  conditionMin: number;
  auctionHouses: string[];
  dateRange: [Date, Date];
}

// Example usage
const activeFilters: FilterPanel = {
  priceRange: [5000, 20000],
  yearRange: [2018, 2023],
  mileageMax: 75000,
  makes: ['Honda', 'Toyota', 'Ford'],
  titleStatus: ['clean'],
  conditionMin: 3
};
```

**Filter Presets:**
```typescript
// Save common filter combinations
const presets = {
  'Budget SUVs': {
    priceRange: [8000, 15000],
    bodyTypes: ['SUV', 'Crossover'],
    yearRange: [2016, 2020],
    mileageMax: 80000
  },
  'Premium Sedans': {
    priceRange: [15000, 30000],
    makes: ['BMW', 'Mercedes-Benz', 'Audi', 'Lexus'],
    bodyTypes: ['Sedan'],
    yearRange: [2018, 2023]
  },
  'Work Trucks': {
    priceRange: [10000, 25000],
    makes: ['Ford', 'Chevrolet', 'Ram'],
    models: ['F-150', 'Silverado', '1500'],
    yearRange: [2015, 2021]
  }
};
```

---

## PART 2: Data Enrichment (AutoNiq Integration)

### 2.1 AutoNiq API Integration

**What AutoNiq Provides:**
- VIN decode (full specs)
- Market valuation (retail, trade-in, wholesale)
- Historical auction results
- Comparable sales data
- Title history / Accident reports
- Service records (when available)
- Market demand indicators
- Days to sell estimates

**API Flow:**
```typescript
interface AutoNiqRequest {
  vin: string;
  mileage: number;
  condition?: string;
  zipCode?: string; // For regional pricing
}

interface AutoNiqResponse {
  vehicle: {
    vin: string;
    year: number;
    make: string;
    model: string;
    trim: string;
    bodyStyle: string;
    engine: string;
    transmission: string;
    drivetrain: string;
    doors: number;
    fuelType: string;
    manufacturerColors: {
      exterior: string;
      interior: string;
    }
  };
  
  valuation: {
    retail: number;
    tradeIn: number;
    wholesale: number;
    loanValue: number;
    mmr: number; // Manheim Market Report
    confidence: 'high' | 'medium' | 'low';
    dataPoints: number; // How many comps used
  };
  
  marketData: {
    avgDaysToSell: number;
    demandScore: number; // 1-100
    supplyLevel: 'low' | 'medium' | 'high';
    trendDirection: 'up' | 'stable' | 'down';
    seasonalFactor: number;
  };
  
  history: {
    titleStatus: 'clean' | 'salvage' | 'rebuilt' | 'flood' | 'lemon';
    accidentCount: number;
    ownerCount: number;
    lastSaleDate?: Date;
    lastSalePrice?: number;
    servicedRecords: number;
  };
  
  comparables: Array<{
    soldDate: Date;
    soldPrice: number;
    mileage: number;
    condition: string;
    location: string;
    daysToSell: number;
  }>;
}

class AutoNiqService {
  async enrichVehicle(vehicle: RawVehicle): Promise<EnrichedVehicle> {
    if (!vehicle.vin) {
      // Try to find VIN by year/make/model/trim
      vehicle.vin = await this.lookupVIN(vehicle);
    }
    
    const autoNiqData = await this.callAutoNiqAPI({
      vin: vehicle.vin,
      mileage: vehicle.mileage,
      condition: vehicle.condition,
      zipCode: vehicle.location
    });
    
    return {
      ...vehicle,
      enriched: true,
      enrichedAt: new Date(),
      autoNiq: autoNiqData,
      profitEstimate: this.calculateProfit(vehicle, autoNiqData)
    };
  }
  
  private calculateProfit(raw: RawVehicle, data: AutoNiqResponse): ProfitEstimate {
    const acquisitionCost = raw.estimatedValue || 0;
    const reconCost = this.estimateReconCost(raw, data);
    const transportCost = 150; // Average
    const feesCost = acquisitionCost * 0.03; // 3% fees
    
    const totalCost = acquisitionCost + reconCost + transportCost + feesCost;
    const expectedRevenue = data.valuation.wholesale * 0.95; // 95% of wholesale
    
    return {
      acquisitionCost,
      reconCost,
      transportCost,
      feesCost,
      totalCost,
      expectedRevenue,
      grossProfit: expectedRevenue - totalCost,
      roi: ((expectedRevenue - totalCost) / totalCost) * 100
    };
  }
}
```

### 2.2 Enrichment Status Tracking

**Visual Indicators:**
```typescript
interface EnrichmentStatus {
  vehicleId: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  progress: number; // 0-100
  lastUpdated: Date;
  error?: string;
}

// Batch enrichment
async function enrichRunlist(runlistId: string) {
  const vehicles = await getVehiclesByRunlist(runlistId);
  const queue = new BatchQueue(vehicles, {
    batchSize: 10, // 10 concurrent API calls
    retryAttempts: 3
  });
  
  for await (const result of queue.process()) {
    await updateVehicle(result.vehicleId, result.data);
    emitProgress(runlistId, queue.progress);
  }
}
```

---

## PART 3: Calendar View & Research Phase

### 3.1 Calendar Organization

**Weekly Calendar Layout:**
- Group vehicles by auction date
- Show enriched data inline
- Color-code by profitability/confidence
- Quick filters within calendar

**Vehicle Card in Calendar:**
```typescript
interface VehicleCard {
  // Core Info
  thumbnail: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  vin: string;
  lotNumber: string;
  
  // Financials
  estimatedPrice: number;
  wholesaleValue: number;
  profitEstimate: number;
  roi: number;
  
  // Status
  enrichmentStatus: 'complete' | 'partial' | 'pending';
  researchStatus: 'not_started' | 'in_progress' | 'complete';
  biddingStrategy?: 'proxy' | 'inlane' | 'skip';
  
  // Key Flags
  hasAccidents: boolean;
  titleStatus: string;
  demandScore: number;
  
  // Quick Actions
  actions: ['view_details', 'mark_proxy', 'mark_inlane', 'skip'];
}
```

**Calendar UI Example:**
```
┌────────────────────────────────────────────────────────────┐
│  Tuesday, Feb 4                              12 vehicles   │
├────────────────────────────────────────────────────────────┤
│  Manheim Atlanta - 10:00 AM                               │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  [IMG] 2019 Honda CR-V EX                    💰 +$4,200  │
│  Lot 456 | VIN: 2HKR...6 | 42k mi           ✅ Clean     │
│  Est: $12,500 → Wholesale: $16,700                        │
│  Demand: 94/100 | 18 days avg                            │
│  [Details] [🎯 Proxy] [👋 In-Lane] [Skip]                │
│                                                            │
│  [IMG] 2020 Toyota Camry SE                  💰 +$2,800  │
│  Lot 457 | VIN: 4T1B...3 | 28k mi           ⚠️ Minor    │
│  Est: $15,200 → Wholesale: $18,000                        │
│  Demand: 87/100 | 22 days avg                            │
│  [Details] [🎯 Proxy] [👋 In-Lane] [Skip]                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 3.2 Research Workflow

**Vehicle Detail View:**
```typescript
interface VehicleDetailView {
  // Header
  hero: {
    images: string[];
    video?: string;
    conditionReport?: string;
  };
  
  // Core Specs
  specs: {
    vin: string;
    year: number;
    make: string;
    model: string;
    trim: string;
    mileage: number;
    engine: string;
    transmission: string;
    drivetrain: string;
    exteriorColor: string;
    interiorColor: string;
    features: string[];
  };
  
  // Financial Analysis
  financials: {
    estimatedAuctionPrice: number;
    valuations: {
      mmr: number;
      wholesale: number;
      retail: number;
      tradeIn: number;
    };
    costs: {
      recon: number;
      transport: number;
      fees: number;
      total: number;
    };
    profit: {
      gross: number;
      roi: number;
    };
  };
  
  // Market Data
  market: {
    demandScore: number;
    avgDaysToSell: number;
    supplyLevel: string;
    trend: string;
    comparables: Comparable[];
  };
  
  // History
  history: {
    titleStatus: string;
    accidents: number;
    owners: number;
    serviceRecords: number;
    lastSale?: {
      date: Date;
      price: number;
      location: string;
    };
  };
  
  // Auction Info
  auction: {
    house: string;
    location: string;
    date: Date;
    time: string;
    lane: string;
    seller: string;
    announcements: string[];
  };
  
  // Research Notes
  notes: {
    buyer: string;
    content: string;
    createdAt: Date;
  }[];
}
```

**Research Checklist:**
```typescript
interface ResearchChecklist {
  vehicleId: string;
  checklist: {
    photosReviewed: boolean;
    conditionReportRead: boolean;
    historyChecked: boolean;
    comparablesReviewed: boolean;
    profitValidated: boolean;
    notesAdded: boolean;
  };
  completedBy?: string;
  completedAt?: Date;
}
```

---

## PART 4: Bidding Strategy Marking

### 4.1 Strategy Types

**Proxy Bid:**
- Set maximum bid amount
- Auction system bids automatically up to max
- Good for high-confidence, known value vehicles
- Set-it-and-forget-it approach

**In-Lane Bid:**
- Buyer actively bids in real-time
- Either physically at auction or via simulcast
- Allows for dynamic decision-making
- React to competition, condition, announcements

**Skip:**
- Do not bid on this vehicle
- Reasons: bad history, overpriced, condition issues, etc.

### 4.2 Marking Interface

```typescript
interface BiddingStrategy {
  vehicleId: string;
  strategy: 'proxy' | 'inlane' | 'skip';
  markedBy: string;
  markedAt: Date;
  
  // Proxy-specific
  proxyBid?: {
    maxBid: number;
    startingBid?: number;
    incrementSize?: number;
    notes?: string;
  };
  
  // In-Lane specific
  inlaneBid?: {
    targetPrice: number;
    walkAwayPrice: number; // Absolute max
    priority: 'high' | 'medium' | 'low';
    notes?: string;
  };
  
  // Skip specific
  skipReason?: {
    reason: 'overpriced' | 'condition' | 'history' | 'low_demand' | 'other';
    notes?: string;
  };
}

class BiddingStrategyManager {
  async markAsProxy(vehicleId: string, maxBid: number, buyer: string) {
    const vehicle = await getVehicle(vehicleId);
    
    // Validation
    if (maxBid > vehicle.autoNiq.valuation.wholesale * 1.1) {
      throw new Error('Max bid exceeds wholesale value by >10%');
    }
    
    await updateVehicle(vehicleId, {
      biddingStrategy: {
        strategy: 'proxy',
        markedBy: buyer,
        markedAt: new Date(),
        proxyBid: {
          maxBid,
          startingBid: maxBid * 0.8, // Start at 80% of max
          incrementSize: 100
        }
      }
    });
    
    // Add to proxy bid queue
    await addToProxyQueue(vehicleId, maxBid);
  }
  
  async markAsInLane(vehicleId: string, targetPrice: number, walkAwayPrice: number, buyer: string) {
    await updateVehicle(vehicleId, {
      biddingStrategy: {
        strategy: 'inlane',
        markedBy: buyer,
        markedAt: new Date(),
        inlaneBid: {
          targetPrice,
          walkAwayPrice,
          priority: 'medium'
        }
      }
    });
    
    // Add to buyer's in-lane list
    await addToBuyerLaneList(buyer, vehicleId);
  }
  
  async markAsSkip(vehicleId: string, reason: string, notes: string, buyer: string) {
    await updateVehicle(vehicleId, {
      biddingStrategy: {
        strategy: 'skip',
        markedBy: buyer,
        markedAt: new Date(),
        skipReason: { reason, notes }
      }
    });
  }
}
```

### 4.3 Strategy Visualization

**Color Coding:**
- 🎯 **Green** = Proxy bid set (ready to execute)
- 👋 **Blue** = In-lane bid planned (requires buyer presence)
- ⏭️ **Gray** = Skipped (not pursuing)
- ⚪ **White** = Unmarked (needs decision)

**Strategy Dashboard:**
```
┌──────────────────────────────────────────────────────────┐
│  Bidding Strategy Summary - Week of Feb 3-9             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🎯 Proxy Bids: 23 vehicles | $287,500 total exposure  │
│  👋 In-Lane: 14 vehicles | $198,000 target value       │
│  ⏭️ Skipped: 47 vehicles                                │
│  ⚪ Unmarked: 89 vehicles (needs review)                │
│                                                          │
│  ────────────────────────────────────────────────────   │
│                                                          │
│  Buyer Assignments:                                      │
│  • John Smith: 8 proxy, 6 in-lane (Tue/Wed auctions)   │
│  • Jane Doe: 15 proxy, 8 in-lane (Thu/Fri auctions)    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## PART 5: Pre-Auction Execution Lists

### 5.1 Proxy Bid Export

**Submit to Auction House:**
```typescript
interface ProxyBidSubmission {
  auctionHouse: string;
  auctionDate: Date;
  buyerAccount: string;
  bids: Array<{
    lotNumber: string;
    vin: string;
    maxBid: number;
    startingBid: number;
  }>;
  totalExposure: number;
  submittedAt: Date;
  submittedBy: string;
}

// Export formats
async function exportProxyBids(auctionDate: Date, format: 'csv' | 'excel' | 'json') {
  const bids = await getProxyBidsByDate(auctionDate);
  
  if (format === 'csv') {
    return generateCSV(bids, [
      'Lot Number',
      'VIN',
      'Year',
      'Make',
      'Model',
      'Max Bid',
      'Starting Bid'
    ]);
  }
  
  if (format === 'excel') {
    return generateExcel(bids, {
      sheetName: `Proxy Bids ${formatDate(auctionDate)}`,
      includeFormulas: true,
      summary: true
    });
  }
}
```

### 5.2 In-Lane Buyer Lists

**Mobile-Friendly View:**
```typescript
interface BuyerLaneList {
  buyer: string;
  auctionDate: Date;
  auctionHouse: string;
  vehicles: Array<{
    lotNumber: string;
    runOrder: number;
    year: number;
    make: string;
    model: string;
    vin: string;
    targetPrice: number;
    walkAwayPrice: number;
    profitAtTarget: number;
    priority: 'high' | 'medium' | 'low';
    notes: string;
    // Real-time status
    status: 'upcoming' | 'in_lane' | 'won' | 'lost' | 'passed';
    finalPrice?: number;
  }>;
}

// Mobile view features
const buyerAppFeatures = {
  offlineAccess: true, // Cache data for spotty auction WiFi
  quickView: true, // Swipe through vehicles in lot order
  liveUpdates: true, // WebSocket connection for real-time status
  noteCapture: true, // Quick voice/text notes during auction
  resultLogging: true // Log win/loss/price immediately
};
```

**Lane List Print View:**
```
════════════════════════════════════════════════════
  BUYER LANE LIST - John Smith
  Manheim Atlanta | Tuesday, Feb 4, 2026 | 10:00 AM
════════════════════════════════════════════════════

LOT 456 | RUN #23
2019 Honda CR-V EX | VIN: 2HKR...6 | 42k mi
Target: $12,500 | Walk: $14,000 | Profit: $4,200
Priority: HIGH
Notes: Clean Carfax, high demand, move fast
────────────────────────────────────────────────────

LOT 482 | RUN #37
2020 Toyota Camry SE | VIN: 4T1B...3 | 28k mi
Target: $15,200 | Walk: $16,500 | Profit: $2,800
Priority: MEDIUM
Notes: Minor dent LR quarter, factor $300 recon
────────────────────────────────────────────────────

[Continue for all vehicles...]
```

---

## PART 6: Database Schema

```sql
-- Bidding strategies
CREATE TABLE bidding_strategies (
  id UUID PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id),
  strategy VARCHAR(20) NOT NULL, -- 'proxy', 'inlane', 'skip'
  marked_by VARCHAR(255) NOT NULL,
  marked_at TIMESTAMP DEFAULT NOW(),
  
  -- Proxy fields
  max_bid DECIMAL(10,2),
  starting_bid DECIMAL(10,2),
  increment_size DECIMAL(10,2),
  
  -- In-lane fields
  target_price DECIMAL(10,2),
  walk_away_price DECIMAL(10,2),
  priority VARCHAR(20),
  
  -- Skip fields
  skip_reason VARCHAR(50),
  skip_notes TEXT,
  
  -- General
  notes TEXT,
  
  CONSTRAINT valid_strategy CHECK (strategy IN ('proxy', 'inlane', 'skip'))
);

-- Research progress
CREATE TABLE research_progress (
  id UUID PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id),
  buyer VARCHAR(255),
  photos_reviewed BOOLEAN DEFAULT FALSE,
  condition_report_read BOOLEAN DEFAULT FALSE,
  history_checked BOOLEAN DEFAULT FALSE,
  comparables_reviewed BOOLEAN DEFAULT FALSE,
  profit_validated BOOLEAN DEFAULT FALSE,
  notes_added BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Buyer notes
CREATE TABLE buyer_notes (
  id UUID PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id),
  buyer VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Auction results (post-sale)
CREATE TABLE auction_results (
  id UUID PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id),
  strategy_id UUID REFERENCES bidding_strategies(id),
  result VARCHAR(20) NOT NULL, -- 'won', 'lost', 'passed', 'no_sale'
  final_price DECIMAL(10,2),
  buyer VARCHAR(255),
  notes TEXT,
  recorded_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_result CHECK (result IN ('won', 'lost', 'passed', 'no_sale'))
);

-- Indexes
CREATE INDEX idx_strategy_vehicle ON bidding_strategies(vehicle_id);
CREATE INDEX idx_strategy_type ON bidding_strategies(strategy);
CREATE INDEX idx_strategy_buyer ON bidding_strategies(marked_by);
CREATE INDEX idx_research_vehicle ON research_progress(vehicle_id);
CREATE INDEX idx_research_buyer ON research_progress(buyer);
```

---

## PART 7: Implementation Priorities

### Phase 1: Core Workflow (Week 1)
- [ ] Runlist upload & parsing
- [ ] Basic filtering UI
- [ ] Calendar view with vehicle cards
- [ ] Strategy marking (proxy/inlane/skip)

### Phase 2: AutoNiq Integration (Week 2)
- [ ] AutoNiq API integration
- [ ] Enrichment queue/progress tracking
- [ ] Valuation display
- [ ] Profit calculation

### Phase 3: Research Tools (Week 3)
- [ ] Vehicle detail view
- [ ] Research checklist
- [ ] Buyer notes
- [ ] Comparable sales display

### Phase 4: Export & Execution (Week 4)
- [ ] Proxy bid export (CSV/Excel)
- [ ] In-lane buyer lists (web + print)
- [ ] Mobile-optimized lane list
- [ ] Results logging

---

## PART 8: User Roles & Permissions

```typescript
enum Role {
  ADMIN = 'admin',
  BUYER = 'buyer',
  ANALYST = 'analyst',
  VIEWER = 'viewer'
}

interface Permissions {
  uploadRunlists: Role[];
  editFilters: Role[];
  enrichVehicles: Role[];
  markStrategies: Role[];
  submitProxyBids: Role[];
  viewAllStrategies: Role[];
  editAnyStrategy: Role[];
  exportData: Role[];
  viewReports: Role[];
}

const permissions: Permissions = {
  uploadRunlists: [Role.ADMIN, Role.ANALYST],
  editFilters: [Role.ADMIN, Role.BUYER, Role.ANALYST],
  enrichVehicles: [Role.ADMIN, Role.ANALYST],
  markStrategies: [Role.ADMIN, Role.BUYER],
  submitProxyBids: [Role.ADMIN, Role.BUYER],
  viewAllStrategies: [Role.ADMIN],
  editAnyStrategy: [Role.ADMIN],
  exportData: [Role.ADMIN, Role.BUYER, Role.ANALYST],
  viewReports: [Role.ADMIN, Role.BUYER, Role.ANALYST, Role.VIEWER]
};
```

---

## PART 9: Key Metrics & Reporting

**Procurement Dashboard:**
```typescript
interface ProcurementMetrics {
  week: {
    totalVehiclesReviewed: number;
    proxyBidsSet: number;
    inlaneBidsPlanned: number;
    skipped: number;
    totalExposure: number; // Sum of all proxy max bids
    estimatedProfit: number; // If all proxies win at max
  };
  
  performance: {
    proxyWinRate: number; // % of proxy bids won
    avgWinPrice: number; // Average final price
    avgProfit: number; // Actual profit per vehicle
    roi: number; // Return on investment %
    cycleTime: number; // Days from upload → sale
  };
  
  inventory: {
    acquired: number;
    inRecon: number;
    listed: number;
    sold: number;
    avgDaysToSell: number;
  };
}
```

---

## Questions for Corey / Clarifications Needed

1. **AutoNiq API:** Do you already have AutoNiq API credentials/access?
2. **Auction House Integration:** Which auction houses? (Manheim, ADESA, others?)
3. **User Count:** How many buyers/analysts will use this?
4. **Mobile:** Do buyers need native mobile apps, or is responsive web enough?
5. **Real-Time:** Do you need live auction tracking, or just pre-auction planning?
6. **Existing System:** Migrating from spreadsheets, or replacing another tool?
7. **Data Retention:** How long to keep historical data? Archive old auctions?

---

**This spec covers the full procurement workflow from upload → execute. Ready to hand to Claude Code!** 🚀
