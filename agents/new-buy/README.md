# New Buy Agent 🚗

**Vehicle Purchase Intake & DMS Entry Specialist**

---

## Purpose

Ensures no purchased vehicle falls through the cracks between auction and DMS. Tracks Bill of Sale intake, manages PSI clearance gate, and handles DealPack entry for all wholesale purchases.

---

## Responsibilities

- **BOS Intake:** Receive and process Bill of Sale documents from all buyers
- **Data Extraction:** Pull VIN, year, make, model, price, seller info from BOS
- **PSI Management:** Track units pending PSI clearance, follow up daily
- **DealPack Entry:** Accurately enter all vehicle data into DMS
- **Payment Flagging:** Note check vs ACH requirements
- **Daily Check-ins:** Proactively ask Jon, Corey, and Sam about new purchases

---

## Workflow

### Morning Routine
1. Send daily check-in to all three buyers
2. Surface any units in PSI hold queue

### BOS Processing
1. Acknowledge receipt
2. Extract vehicle data
3. Confirm accuracy with buyer
4. Check PSI requirement
5. Hold or enter based on PSI status
6. Confirm DealPack record created

### PSI Gate
- Track pending units in `memory/WORKING.md`
- Daily follow-up until cleared
- Never enter into DealPack without clearance

---

## Files

- **SOUL.md** — Agent identity, personality, workflow
- **USER.md** — Buyer contacts, communication style
- **memory/WORKING.md** — PSI queue, pending entries, open items
- **AGENTS.md** → Shared workspace context
- **HEARTBEAT.md** → Shared heartbeat protocol
- **TOOLS.md** → Shared tools reference

---

## Setup Required

1. **Register in Mission Control** — Get Convex agent ID
2. **Set up cron heartbeat** — Stagger by 2 min from other agents
3. **Configure Telegram access** — Get Jon and Sam's Telegram IDs
4. **DealPack credentials** — Secure login for DMS entry
5. **Test BOS workflow** — Validate document extraction

---

## Session

`agent:new-buy:main`

---

**Status:** Structure created, ready for registration and deployment
