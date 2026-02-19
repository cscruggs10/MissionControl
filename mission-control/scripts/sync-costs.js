#!/usr/bin/env node

/**
 * Sync cost data from session logs to Convex database
 * Generates shell commands to run via convex CLI
 */

const { aggregateAllSessions, aggregateByDate, aggregateBySession } = require('./extract-costs');
const { execSync } = require('child_process');

async function syncData() {
  console.log('\n🔄 Extracting cost data from session logs...\n');
  
  // Extract data from session files
  const allUsage = await aggregateAllSessions();
  const byDate = aggregateByDate(allUsage);
  const bySession = aggregateBySession(allUsage);
  
  console.log('\n📤 Syncing to Convex database...\n');
  
  // Sync daily aggregates
  console.log(`   Syncing ${byDate.length} daily aggregates...`);
  let synced = 0;
  for (const day of byDate) {
    try {
      const cmd = `npx convex run costTracking:updateDailyAggregate '${JSON.stringify({
        date: day.date,
        totalCost: day.totalCost,
        totalTokens: day.totalTokens,
        callCount: day.calls,
        modelBreakdown: day.models,
      }).replace(/'/g, "\\'")}'`;
      
      execSync(cmd, { cwd: '/root/clawd/mission-control', stdio: 'pipe' });
      synced++;
      
      if (synced % 5 === 0 || synced === byDate.length) {
        process.stdout.write(`   Progress: ${synced}/${byDate.length}\r`);
      }
    } catch (err) {
      console.error(`\n   ❌ Failed to sync ${day.date}:`, err.message);
    }
  }
  console.log(`\n   ✅ Synced ${synced} daily aggregates`);
  
  // Sync session aggregates (top 20 only for speed)
  const topSessions = bySession.slice(0, 20);
  console.log(`\n   Syncing top ${topSessions.length} sessions...`);
  synced = 0;
  
  for (const session of topSessions) {
    try {
      const cmd = `npx convex run costTracking:updateSessionAggregate '${JSON.stringify({
        sessionId: session.sessionId,
        totalCost: session.totalCost,
        totalTokens: session.totalTokens,
        callCount: session.calls,
        firstCall: session.firstCall,
        lastCall: session.lastCall,
      }).replace(/'/g, "\\'")}'`;
      
      execSync(cmd, { cwd: '/root/clawd/mission-control', stdio: 'pipe' });
      synced++;
      
      if (synced % 10 === 0 || synced === topSessions.length) {
        process.stdout.write(`   Progress: ${synced}/${topSessions.length}\r`);
      }
    } catch (err) {
      console.error(`\n   ❌ Failed to sync session ${session.sessionId.substring(0, 8)}:`, err.message);
    }
  }
  console.log(`\n   ✅ Synced ${synced} session aggregates`);
  
  // Test queries
  console.log('\n🧪 Testing queries...\n');
  
  try {
    const summaryCmd = `npx convex run costTracking:getSummaryStats`;
    const summary = JSON.parse(execSync(summaryCmd, { cwd: '/root/clawd/mission-control', encoding: 'utf8' }));
    
    console.log('   📊 Summary Stats:');
    console.log(`   - Total Cost: $${summary.totalCost.toFixed(2)}`);
    console.log(`   - Last 24h:   $${summary.last24h.toFixed(2)}`);
    console.log(`   - Last 7d:    $${summary.last7d.toFixed(2)}`);
    console.log(`   - Last 30d:   $${summary.last30d.toFixed(2)}`);
    console.log(`   - Avg/Day:    $${summary.avgPerDay.toFixed(2)}`);
    console.log(`   - Trend:      ${summary.trend}`);
  } catch (err) {
    console.error('   ❌ Failed to query summary:', err.message);
  }
  
  console.log('\n✅ Sync complete!\n');
}

if (require.main === module) {
  syncData().catch(err => {
    console.error('\n❌ Sync failed:', err);
    process.exit(1);
  });
}

module.exports = { syncData };
