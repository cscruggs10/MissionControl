#!/usr/bin/env node

/**
 * Generate and send cost reports via Telegram
 * Can be run manually or via cron job
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Config
const DAILY_THRESHOLD = 50; // Alert if daily spending exceeds this
const WEEKLY_THRESHOLD = 250;  // Alert if weekly spending exceeds this

async function generateReport() {
  console.log('\n📊 Generating cost report...\n');
  
  try {
    // Query Convex for summary data
    const summaryCmd = `npx convex run costTracking:getSummaryStats`;
    const summary = JSON.parse(execSync(summaryCmd, { 
      cwd: '/root/clawd/mission-control', 
      encoding: 'utf8' 
    }));
    
    const dailyCmd = `npx convex run costTracking:getDailyCosts '{"days": 7}'`;
    const dailyCosts = JSON.parse(execSync(dailyCmd, { 
      cwd: '/root/clawd/mission-control', 
      encoding: 'utf8' 
    }));
    
    const modelsCmd = `npx convex run costTracking:getModelBreakdown '{"days": 7}'`;
    const models = JSON.parse(execSync(modelsCmd, { 
      cwd: '/root/clawd/mission-control', 
      encoding: 'utf8' 
    }));
    
    const alertCmd = `npx convex run costTracking:checkSpendingAlert '{"dailyThreshold": ${DAILY_THRESHOLD}}'`;
    const alert = JSON.parse(execSync(alertCmd, { 
      cwd: '/root/clawd/mission-control', 
      encoding: 'utf8' 
    }));
    
    // Build report message
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    let report = `📊 *Compute Cost Report* — ${dateStr} ${timeStr}\n\n`;
    
    // Summary
    report += `💰 *Summary*\n`;
    report += `• Last 24h: $${summary.last24h.toFixed(2)}\n`;
    report += `• Last 7d: $${summary.last7d.toFixed(2)}\n`;
    report += `• Avg/day: $${summary.avgPerDay.toFixed(2)}\n`;
    report += `• Trend: ${getTrendEmoji(summary.trend)} ${summary.trend}\n\n`;
    
    // Alert if over threshold
    if (alert.alert) {
      report += `⚠️ *ALERT: Daily spending exceeded $${DAILY_THRESHOLD}*\n`;
      report += `Current: $${alert.cost.toFixed(2)} (${alert.percentOfThreshold.toFixed(0)}% of threshold)\n\n`;
    }
    
    if (summary.last7d > WEEKLY_THRESHOLD) {
      report += `⚠️ *ALERT: Weekly spending exceeded $${WEEKLY_THRESHOLD}*\n`;
      report += `Current: $${summary.last7d.toFixed(2)}\n\n`;
    }
    
    // Daily breakdown (last 3 days)
    report += `📅 *Recent Daily Costs*\n`;
    for (const day of dailyCosts.slice(0, 3)) {
      const models = Object.entries(day.modelBreakdown || {});
      const topModel = models.sort((a, b) => b[1].cost - a[1].cost)[0];
      const modelName = topModel ? topModel[0].replace('claude-', '').replace('gemini-', '') : 'N/A';
      
      report += `• ${day.date}: $${day.totalCost.toFixed(2)} (${day.callCount} calls, mostly ${modelName})\n`;
    }
    report += `\n`;
    
    // Model breakdown
    report += `🤖 *Model Usage (7d)*\n`;
    for (const model of models.slice(0, 3)) {
      const shortName = model.model
        .replace('claude-', '')
        .replace('gemini-', '')
        .replace('sonnet-', 'sonnet ')
        .replace('haiku-', 'haiku ');
      const pct = ((model.cost / summary.last7d) * 100).toFixed(0);
      report += `• ${shortName}: $${model.cost.toFixed(2)} (${pct}%)\n`;
    }
    report += `\n`;
    
    // Projections
    const monthlyProjection = summary.avgPerDay * 30;
    report += `📈 *Projections*\n`;
    report += `• Monthly (at current rate): $${monthlyProjection.toFixed(2)}\n\n`;
    
    // Optimization suggestions
    if (summary.trend === 'increasing') {
      report += `💡 *Optimization Tip*\n`;
      report += `Costs are trending up. Consider:\n`;
      report += `• Using Haiku for simpler tasks (5x cheaper)\n`;
      report += `• Reviewing recent high-cost sessions\n`;
      report += `• Checking prompt caching effectiveness\n\n`;
    }
    
    report += `🔗 View full dashboard: http://134.199.192.218:3000/costs`;
    
    return report;
    
  } catch (err) {
    console.error('❌ Failed to generate report:', err.message);
    throw err;
  }
}

function getTrendEmoji(trend) {
  switch (trend) {
    case 'increasing':
      return '📈';
    case 'decreasing':
      return '📉';
    default:
      return '➡️';
  }
}

async function sendReport() {
  console.log('📤 Sending cost report...\n');
  
  const report = await generateReport();
  
  console.log('Generated report:\n');
  console.log(report);
  console.log('\n');
  
  // Save report to file for record-keeping
  const reportFile = `/root/clawd/mission-control/data/cost-reports/${new Date().toISOString().split('T')[0]}-${Date.now()}.txt`;
  fs.mkdirSync('/root/clawd/mission-control/data/cost-reports', { recursive: true });
  fs.writeFileSync(reportFile, report);
  console.log(`💾 Saved report to: ${reportFile}\n`);
  
  // Send via Telegram using clawdbot message tool
  // Note: This will be called by the main agent via cron
  // For manual testing, just print the report
  
  console.log('✅ Report ready to send!\n');
  
  return report;
}

async function syncAndReport() {
  console.log('🔄 Step 1: Syncing latest cost data...\n');
  
  try {
    // Run sync script first to get latest data
    execSync('node /root/clawd/mission-control/scripts/sync-costs.js', {
      cwd: '/root/clawd/mission-control',
      stdio: 'inherit'
    });
    
    console.log('\n✅ Sync complete!\n');
  } catch (err) {
    console.error('⚠️ Sync had errors, continuing with report...\n');
  }
  
  console.log('🔄 Step 2: Generating report...\n');
  const report = await sendReport();
  
  return report;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'report';
  
  if (command === 'sync-and-report') {
    syncAndReport().catch(err => {
      console.error('\n❌ Failed:', err);
      process.exit(1);
    });
  } else if (command === 'report') {
    sendReport().catch(err => {
      console.error('\n❌ Failed:', err);
      process.exit(1);
    });
  } else {
    console.log('Usage: node report-costs.js [sync-and-report|report]');
    console.log('  sync-and-report - Sync data from logs then generate report');
    console.log('  report          - Generate report from existing data (default)');
    process.exit(1);
  }
}

module.exports = { generateReport, sendReport, syncAndReport };
