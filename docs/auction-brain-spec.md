# Auction Intelligence System - Development Spec

## Overview
Transform the auction data processing system into an intelligent assistant that:
1. Automatically identifies strong buying signals
2. Organizes auction runlists in a calendar-weekly view
3. Provides natural language query interface (Claude-style chat)

---

## PART 1: Intelligence Layer ("The Brain")

### 1.1 Signal Detection Engine

**Objective:** Automatically scan announcements and auction data for strong buying signals

**Buying Signal Criteria:**
- Price anomalies (significantly below market/book value)
- High-demand vehicle models/years
- Low mileage relative to year
- Clean title + desirable condition
- Popular geographic markets
- Trending vehicle categories
- Dealer inventory urgency indicators
- Historical fast-sell patterns

**Implementation:**
```typescript
interface BuyingSignal {
  vehicleId: string;
  signalType: 'price_anomaly' | 'high_demand' | 'low_mileage' | 'fast_mover' | 'market_trend';
  confidence: number; // 0-100
  reasons: string[];
  estimatedProfit: number;
  marketComps: Comp[];
  createdAt: Date;
}

class SignalDetector {
  async analyzeVehicle(vehicle: EnrichedVehicle): Promise<BuyingSignal[]> {
    // 1. Price Analysis
    const priceSignal = this.detectPriceAnomaly(vehicle);
    
    // 2. Market Demand
    const demandSignal = this.analyzeDemand(vehicle);
    
    // 3. Mileage/Condition
    const conditionSignal = this.evaluateCondition(vehicle);
    
    // 4. Historical Performance
    const historySignal = this.checkHistory(vehicle);
    
    return this.combineSignals([priceSignal, demandSignal, conditionSignal, historySignal]);
  }
  
  private detectPriceAnomaly(vehicle: EnrichedVehicle): BuyingSignal | null {
    // Compare against:
    // - Book value (KBB/NADA)
    // - Recent auction comps
    // - Retail market prices
    // Flag if 15%+ below expected
  }
  
  private analyzeDemand(vehicle: EnrichedVehicle): BuyingSignal | null {
    // Check:
    // - Make/model popularity trends
    // - Days on market for similar vehicles
    // - Geographic demand heatmap
  }
}
```

**Alert System:**
- **High Priority (90%+ confidence):** Immediate alert via Telegram/Notification
- **Medium Priority (70-89%):** Add to "Hot Leads" list, review queue
- **Low Priority (50-69%):** Flag in system, available for query

**Alert Format:**
```
🚨 HIGH CONFIDENCE BUYING SIGNAL

2019 Honda CR-V EX | VIN: 2HKRM4H71HH123456
Auction: Manheim Atlanta | Tuesday, Feb 4 @ 10:00 AM

💰 Expected Profit: $4,200
📊 Confidence: 94%

Reasons:
✓ 28% below book value ($12,500 vs $17,400)
✓ High-demand model (avg 18 days to sell)
✓ Only 42k miles (avg 68k for year)
✓ Clean Carfax, single owner

[View Details] [Add to Watchlist] [Dismiss]
```

---

## PART 2: Auction Runlist Calendar System

### 2.1 Database Schema

```sql
-- Auction Runlists
CREATE TABLE auction_runlists (
  id UUID PRIMARY KEY,
  auction_house VARCHAR(255), -- Manheim, Adesa, etc.
  auction_location VARCHAR(255),
  auction_date DATE NOT NULL,
  auction_time TIME,
  runlist_name VARCHAR(255),
  source_file VARCHAR(500), -- Original file path/URL
  imported_at TIMESTAMP DEFAULT NOW(),
  vehicle_count INTEGER,
  processed_count INTEGER,
  signals_count INTEGER, -- # of strong signals found
  status VARCHAR(50) -- 'processing', 'complete', 'error'
);

-- Link vehicles to runlists
CREATE TABLE runlist_vehicles (
  runlist_id UUID REFERENCES auction_runlists(id),
  vehicle_id UUID REFERENCES vehicles(id),
  lot_number VARCHAR(100),
  run_order INTEGER,
  PRIMARY KEY (runlist_id, vehicle_id)
);

-- Index for fast calendar queries
CREATE INDEX idx_auction_date ON auction_runlists(auction_date);
CREATE INDEX idx_auction_date_location ON auction_runlists(auction_date, auction_location);
```

### 2.2 Weekly Calendar View

**UI Component Structure:**

```typescript
interface WeekView {
  weekStart: Date;
  weekEnd: Date;
  days: DayView[];
}

interface DayView {
  date: Date;
  dayOfWeek: string; // 'Monday', 'Tuesday', etc.
  auctions: AuctionSummary[];
  totalVehicles: number;
  totalSignals: number;
}

interface AuctionSummary {
  runlistId: string;
  auctionHouse: string;
  location: string;
  time: string;
  vehicleCount: number;
  signalCount: number;
  topSignals: BuyingSignal[]; // Top 3-5
  processingStatus: 'pending' | 'processing' | 'complete';
}
```

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Week of Feb 3-9, 2026                    [← Prev] [Today] [Next →] │
├─────────────────────────────────────────────────────────────────┤
│  MON 2/3   │  TUE 2/4   │  WED 2/5   │  THU 2/6   │  FRI 2/7   │
│            │            │            │            │            │
│  No        │  Manheim   │  ADESA     │  Manheim   │  Manheim   │
│  Auctions  │  Atlanta   │  Memphis   │  Dallas    │  Atlanta   │
│            │  10:00 AM  │  2:00 PM   │  9:00 AM   │  1:00 PM   │
│            │  456 cars  │  234 cars  │  678 cars  │  345 cars  │
│            │  🔥 12     │  🔥 5      │  🔥 23     │  🔥 8      │
│            │            │            │            │            │
│            │  Manheim   │            │            │            │
│            │  Nashville │            │            │            │
│            │  2:00 PM   │            │            │            │
│            │  189 cars  │            │            │            │
│            │  🔥 7      │            │            │            │
├─────────────────────────────────────────────────────────────────┤
│  🔥 = High confidence buying signals                             │
└─────────────────────────────────────────────────────────────────┘
```

**Interaction Features:**
- Click day → Expand to show full runlist details
- Click auction → Open detailed vehicle list with signals highlighted
- Hover signal count → Preview top 3 opportunities
- Drag-drop between days → Reschedule/plan
- Export day/week → PDF/Excel for offline review

### 2.3 Real-Time Population

**Live Loading Experience:**
```typescript
class RunlistLoader {
  async processRunlist(file: File) {
    // 1. Create runlist record
    const runlist = await this.createRunlist({
      file: file.name,
      status: 'processing'
    });
    
    // 2. Stream vehicles as they process
    for await (const vehicle of this.parseFile(file)) {
      const enriched = await this.enrichVehicle(vehicle);
      const signals = await this.detectSignals(enriched);
      
      // 3. Update calendar in real-time
      await this.updateRunlistProgress(runlist.id, {
        processedCount: ++count,
        signalsFound: signals.length
      });
      
      // 4. Broadcast WebSocket update
      this.ws.broadcast('runlist:vehicle_added', {
        runlistId: runlist.id,
        vehicle: enriched,
        signals
      });
    }
    
    // 5. Mark complete
    await this.completeRunlist(runlist.id);
  }
}
```

**Frontend Real-Time Updates:**
```typescript
// WebSocket listener
socket.on('runlist:vehicle_added', (data) => {
  // Update vehicle count
  updateAuctionCard(data.runlistId, {
    vehicleCount: +1,
    signalCount: data.signals.length
  });
  
  // If high-confidence signal, show toast
  if (data.signals.some(s => s.confidence >= 90)) {
    showToast('🔥 High-value opportunity found!');
  }
});
```

---

## PART 3: Natural Language Query Interface

### 3.1 Chat Interface Design

**UI Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│  Auction Intelligence Chat                          [↓ Export] │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  👤 Show me all Honda CR-Vs under $15k in this week's        │
│     auctions                                                  │
│                                                               │
│  🤖 Found 23 Honda CR-Vs under $15,000 across 4 auctions:   │
│                                                               │
│     Tuesday, Feb 4 - Manheim Atlanta (8 vehicles)            │
│     • 2019 CR-V EX - $12,500 - 🔥 94% confidence            │
│     • 2018 CR-V LX - $13,200 - 72% confidence               │
│     • 2020 CR-V Sport - $14,800 - 88% confidence            │
│     [View All 8 →]                                            │
│                                                               │
│     Wednesday, Feb 5 - ADESA Memphis (3 vehicles)            │
│     Thursday, Feb 6 - Manheim Dallas (9 vehicles)            │
│     Friday, Feb 7 - Manheim Atlanta (3 vehicles)             │
│                                                               │
│     [Export Results] [Add to Watchlist] [Set Alert]          │
│                                                               │
│  👤 Which auction has the best profit opportunities?         │
│                                                               │
│  🤖 Based on signal analysis:                                │
│                                                               │
│     🏆 Manheim Dallas (Thursday, Feb 6)                      │
│     • 23 high-confidence signals                             │
│     • Avg estimated profit: $3,800/vehicle                   │
│     • Top opportunity: 2020 Toyota Tacoma ($6,200 profit)    │
│                                                               │
│     [View Full Analysis →]                                    │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│  Ask about vehicles, auctions, trends, or opportunities...   │
│  [Type message...]                            [Send] [Voice] │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Query Processing Engine

**Natural Language → Structured Query:**

```typescript
interface QueryIntent {
  action: 'search' | 'analyze' | 'compare' | 'recommend' | 'forecast';
  entities: {
    makes?: string[];
    models?: string[];
    years?: number[];
    priceRange?: [number, number];
    mileageRange?: [number, number];
    auctions?: string[];
    dates?: DateRange;
    locations?: string[];
  };
  filters: Filter[];
  sortBy?: 'price' | 'confidence' | 'profit' | 'date';
  limit?: number;
}

class QueryProcessor {
  async processNaturalLanguage(query: string): Promise<QueryIntent> {
    // Use Claude API to parse intent
    const response = await claude.messages.create({
      model: 'claude-sonnet-4',
      messages: [{
        role: 'user',
        content: `Parse this auction query into structured format:
        
Query: "${query}"

Extract:
- Action (search/analyze/compare/recommend/forecast)
- Vehicle criteria (make, model, year, price, mileage)
- Auction filters (date, location, house)
- Sorting preference

Return JSON.`
      }]
    });
    
    return JSON.parse(response.content);
  }
  
  async executeQuery(intent: QueryIntent): Promise<QueryResult> {
    // Build SQL/query from intent
    const sql = this.buildQuery(intent);
    const results = await this.db.query(sql);
    
    // Enrich with signals
    const enriched = await Promise.all(
      results.map(v => this.addSignalContext(v))
    );
    
    return this.formatResponse(enriched, intent);
  }
  
  async generateNaturalResponse(results: QueryResult): Promise<string> {
    // Use Claude to generate human-readable response
    const response = await claude.messages.create({
      model: 'claude-sonnet-4',
      messages: [{
        role: 'user',
        content: `Convert these query results into a conversational response:
        
${JSON.stringify(results, null, 2)}

Be concise, highlight key insights, format numbers clearly.`
      }]
    });
    
    return response.content;
  }
}
```

### 3.3 Example Query Patterns

**Supported Query Types:**

1. **Vehicle Search:**
   - "Show me all Toyotas under $20k"
   - "Find Honda Accords from 2018-2020 with under 50k miles"
   - "What Silverados are in next week's auctions?"

2. **Signal-Based:**
   - "Show me the best opportunities this week"
   - "Which vehicles have the highest profit potential?"
   - "Alert me when a 2019+ F-150 appears under $25k"

3. **Auction Analysis:**
   - "Compare Manheim Atlanta vs ADESA Memphis this week"
   - "Which auction has the most inventory on Tuesday?"
   - "Show me auction trends for the past month"

4. **Market Intelligence:**
   - "What's the average price for 2020 CR-Vs?"
   - "Are pickup trucks trending up or down?"
   - "Show me fast-moving vehicles from last week"

5. **Planning:**
   - "Build me a buying list for Tuesday's auctions"
   - "What's my ROI potential this week?"
   - "Schedule alerts for high-value SUVs"

### 3.4 Advanced Features

**Context Awareness:**
```typescript
class ChatSession {
  private context: ConversationContext = {
    previousQueries: [],
    activeFilters: {},
    userPreferences: {},
  };
  
  async handleMessage(message: string): Promise<Response> {
    // Remember context
    if (message.includes('them')) {
      // "Show me more details about them" → use previous results
      return this.expandLastResults();
    }
    
    if (message.includes('same but')) {
      // "Show me the same but for Fords" → modify last query
      return this.modifyLastQuery(message);
    }
    
    // Learn preferences
    if (message.includes('I prefer') || message.includes('focus on')) {
      await this.updatePreferences(message);
    }
  }
}
```

**Smart Suggestions:**
```typescript
// After showing results, suggest follow-ups
const suggestions = [
  'Compare these to last week',
  'Show me similar vehicles',
  'Set alert for these criteria',
  'Export to buying list',
  'Calculate total investment needed'
];
```

---

## PART 4: Integration Architecture

### 4.1 System Flow

```
┌─────────────────┐
│  Runlist Upload │
└────────┬────────┘
         │
         ▼
┌─────────────────┐       ┌──────────────────┐
│  File Parser    │──────▶│  Signal Detector │
└────────┬────────┘       └────────┬─────────┘
         │                         │
         │                         ▼
         │                ┌─────────────────┐
         │                │  Alert Engine   │
         │                └────────┬────────┘
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│  Enrichment     │       │  Telegram/Push  │
└────────┬────────┘       └─────────────────┘
         │
         ▼
┌─────────────────┐       ┌─────────────────┐
│  Database       │◀──────│  Chat Interface │
└────────┬────────┘       └─────────────────┘
         │
         ▼
┌─────────────────┐
│  Calendar View  │
└─────────────────┘
```

### 4.2 Tech Stack Recommendations

**Backend:**
- **API:** NestJS or Express (TypeScript)
- **Database:** PostgreSQL (structured data) + Redis (caching)
- **Queue:** Bull (for async processing)
- **WebSockets:** Socket.io (real-time updates)
- **AI:** Anthropic Claude API (query processing)

**Frontend:**
- **Framework:** Next.js 14 (App Router)
- **UI:** Tailwind + shadcn/ui
- **Calendar:** FullCalendar or custom with date-fns
- **Chat:** Custom component (inspired by Claude UI)
- **Real-time:** Socket.io-client
- **State:** Zustand or Jotai

**Infrastructure:**
- **Hosting:** Vercel (frontend) + Railway/Render (backend)
- **Storage:** S3 (runlist files)
- **Monitoring:** Sentry + LogTail
- **Analytics:** PostHog

---

## PART 5: Implementation Phases

### Phase 1: Intelligence Layer (Week 1)
- [ ] Build signal detection engine
- [ ] Implement scoring algorithms
- [ ] Create alert system
- [ ] Test with historical data

### Phase 2: Calendar System (Week 2)
- [ ] Database schema for runlists
- [ ] Weekly calendar UI component
- [ ] Real-time runlist loading
- [ ] Drag-drop interactions

### Phase 3: Chat Interface (Week 3)
- [ ] Chat UI component
- [ ] Natural language processing
- [ ] Query execution engine
- [ ] Context management

### Phase 4: Integration & Polish (Week 4)
- [ ] Connect all systems
- [ ] Mobile responsive design
- [ ] Performance optimization
- [ ] User testing & refinement

---

## PART 6: Success Metrics

**Intelligence:**
- Signal accuracy rate (% that actually sell profitably)
- False positive rate
- Average profit per flagged vehicle

**Usage:**
- Daily active users
- Queries per session
- Calendar views per week
- Conversion rate (views → purchases)

**Performance:**
- Runlist processing time
- Query response time (<2s)
- Real-time update latency (<500ms)

---

## Next Steps for Claude Code

1. **Start with database schema** - Set up PostgreSQL tables
2. **Build signal detector** - Core intelligence logic
3. **Create calendar API** - Endpoints for weekly view
4. **Implement chat backend** - Query processing engine
5. **Build frontend components** - Calendar + Chat UI
6. **Wire up WebSockets** - Real-time updates
7. **Test end-to-end** - With real runlist data

---

## Questions to Clarify

1. **Current tech stack** - What's already built? (Framework, database, etc.)
2. **Data sources** - Where do runlists come from? (CSV, Excel, API?)
3. **Enrichment APIs** - Already using KBB/NADA/Carfax?
4. **Alert preferences** - Telegram, email, SMS, push?
5. **User count** - Single user (you) or team/multi-user?
6. **Budget** - Claude API costs, hosting, etc.

---

**This spec gives Claude Code everything needed to build your auction brain. Drop it in the chat and let it rip. 🚀**
