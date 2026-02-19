#!/usr/bin/env node

/**
 * Import cost data from session logs into Convex database
 */

const { ConvexHttpClient } = require("convex/browser");
const fs = require('fs');
const path = require('path');

const DEPLOYMENT_URL = process.env.CONVEX_URL || "https://kindly-hyena-65.convex.cloud";

const { aggregateAllSessions, aggregateByDate, aggregateBySession } = require('./extract-costs');

async function importData() {
  const client = new ConvexHttpClient(DEPLOYMENT_URL);
  
  console.log('\n🔄 Extracting cost data from session logs...\n');
  
  // Extract data from session files
  const allUsage = await aggregateAllSessions();
  const byDate = aggregateByDate(allUsage);
  const bySession = aggregateBySession(allUsage);
  
  console.log('\n📤 Importing into Convex...\n');
  
  // Import daily aggregates
  let imported = 0;
  for (const day of byDate) {
    try {
      await client.mutation("costTracking:updateDailyAggregate", {
        date: day.date,
        totalCost: day.totalCost,
        totalTokens: day.totalTokens,
        callCount: day.calls,
        modelBreakdown: day.models,
      });
      imported++;
      process.stdout.write(`   Daily aggregates: ${imported}/${byDate.length}\r`);
    } catch (err) {
      console.error(`\n   ❌ Failed to import ${day.date}:`, err.message || err);
      if (imported === 0) {
        // Show full error for first failure
        console.error(err);
      }
    }
  }
  console.log(`\n   ✅ Imported ${imported} daily aggregates`);
  
  // Import session aggregates
  imported = 0;
  for (const session of bySession) {
    try {
      await client.mutation("costTracking:updateSessionAggregate", {
        sessionId: session.sessionId,
        totalCost: session.totalCost,
        totalTokens: session.totalTokens,
        callCount: session.calls,
        firstCall: session.firstCall,
        lastCall: session.lastCall,
      });
      imported++;
      
      if (imported % 50 === 0) {
        process.stdout.write(`   Session aggregates: ${imported}/${bySession.length}\r`);
      }
    } catch (err) {
      console.error(`\n   ❌ Failed to import session ${session.sessionId}:`, err.message || err);
      if (imported === 0) {
        // Show full error for first failure
        console.error(err);
      }
    }
  }
  console.log(`\n   ✅ Imported ${imported} session aggregates`);
  
  // Test queries
  console.log('\n🧪 Testing queries...\n');
  
  const summary = await client.query("costTracking:getSummaryStats");
  console.log('   Summary Stats:');
  console.log(`   - Total Cost: $${summary.totalCost.toFixed(2)}`);
  console.log(`   - Last 24h:   $${summary.last24h.toFixed(2)}`);
  console.log(`   - Last 7d:    $${summary.last7d.toFixed(2)}`);
  console.log(`   - Last 30d:   $${summary.last30d.toFixed(2)}`);
  console.log(`   - Avg/Day:    $${summary.avgPerDay.toFixed(2)}`);
  console.log(`   - Trend:      ${summary.trend}`);
  
  const topSessions = await client.query("costTracking:getTopSessions", { limit: 3 });
  console.log(`\n   Top 3 Sessions:`);
  for (const session of topSessions) {
    console.log(`   - ${session.sessionId.substring(0, 8)}...: $${session.totalCost.toFixed(2)}`);
  }
  
  const models = await client.query("costTracking:getModelBreakdown", { days: 7 });
  console.log(`\n   Model Breakdown (7d):`);
  for (const model of models) {
    console.log(`   - ${model.model}: $${model.cost.toFixed(2)} (${model.calls} calls)`);
  }
  
  console.log('\n✅ Import complete!\n');
  
  client.close();
}

if (require.main === module) {
  importData().catch(err => {
    console.error('\n❌ Import failed:', err);
    process.exit(1);
  });
}

module.exports = { importData };
