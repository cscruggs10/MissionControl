#!/usr/bin/env node

/**
 * Extract API usage costs from Clawdbot session logs
 * Parses .jsonl session files and aggregates cost data
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SESSIONS_DIR = '/root/.clawdbot/agents/main/sessions';

// Anthropic Pricing (per 1M tokens as of 2024)
// Source: https://www.anthropic.com/pricing
const PRICING = {
  'claude-sonnet-4-5-20250929': {
    input: 3.00,
    output: 15.00,
    cacheWrite: 3.75,
    cacheRead: 0.30
  },
  'claude-sonnet-3-5-20240620': {
    input: 3.00,
    output: 15.00,
    cacheWrite: 3.75,
    cacheRead: 0.30
  },
  'claude-haiku-3-5-20241022': {
    input: 0.80,
    output: 4.00,
    cacheWrite: 1.00,
    cacheRead: 0.08
  },
  'claude-3-5-haiku-20241022': {
    input: 0.80,
    output: 4.00,
    cacheWrite: 1.00,
    cacheRead: 0.08
  },
  'claude-opus-3-5-20240229': {
    input: 15.00,
    output: 75.00,
    cacheWrite: 18.75,
    cacheRead: 1.50
  },
  // Gemini Pricing
  'gemini-2.0-flash': {
    input: 0.10,
    output: 0.40,
    cacheWrite: 0.10,
    cacheRead: 0.01
  },
  'gemini-1.5-flash': {
    input: 0.075,
    output: 0.30,
    cacheWrite: 0.09375,
    cacheRead: 0.01875
  },
  'gemini-1.5-pro': {
    input: 1.25,
    output: 5.00,
    cacheWrite: 1.5625,
    cacheRead: 0.3125
  }
};

async function parseSessionFile(filePath) {
  const usage = [];
  
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let sessionId = null;
  
  for await (const line of rl) {
    try {
      const entry = JSON.parse(line);
      
      // Extract session ID from first line
      if (entry.type === 'session' && entry.id) {
        sessionId = entry.id;
      }
      
      // Extract usage from assistant messages
      if (entry.type === 'message' && 
          entry.message?.role === 'assistant' && 
          entry.message?.usage) {
        
        const msg = entry.message;
        usage.push({
          sessionId: sessionId,
          timestamp: entry.timestamp,
          model: msg.model,
          provider: msg.provider,
          usage: msg.usage,
          cost: msg.usage.cost
        });
      }
    } catch (err) {
      // Skip malformed lines
    }
  }
  
  return usage;
}

async function aggregateAllSessions() {
  const files = fs.readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith('.jsonl'))
    .map(f => path.join(SESSIONS_DIR, f));
  
  console.log(`\n📊 Analyzing ${files.length} session files...\n`);
  
  const allUsage = [];
  let processed = 0;
  
  for (const file of files) {
    const usage = await parseSessionFile(file);
    allUsage.push(...usage);
    processed++;
    
    if (processed % 50 === 0) {
      process.stdout.write(`Processed ${processed}/${files.length} sessions...\r`);
    }
  }
  
  console.log(`\n✅ Processed ${processed} sessions, found ${allUsage.length} API calls\n`);
  
  return allUsage;
}

function aggregateByDate(allUsage) {
  const byDate = {};
  
  for (const call of allUsage) {
    const date = call.timestamp.split('T')[0]; // YYYY-MM-DD
    
    if (!byDate[date]) {
      byDate[date] = {
        date,
        totalCost: 0,
        totalTokens: 0,
        calls: 0,
        models: {}
      };
    }
    
    byDate[date].totalCost += call.cost?.total || 0;
    byDate[date].totalTokens += call.usage?.totalTokens || 0;
    byDate[date].calls += 1;
    
    // Aggregate by model
    const model = call.model || 'unknown';
    if (!byDate[date].models[model]) {
      byDate[date].models[model] = {
        calls: 0,
        cost: 0,
        tokens: 0,
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0
      };
    }
    
    byDate[date].models[model].calls += 1;
    byDate[date].models[model].cost += call.cost?.total || 0;
    byDate[date].models[model].tokens += call.usage?.totalTokens || 0;
    byDate[date].models[model].input += call.usage?.input || 0;
    byDate[date].models[model].output += call.usage?.output || 0;
    byDate[date].models[model].cacheRead += call.usage?.cacheRead || 0;
    byDate[date].models[model].cacheWrite += call.usage?.cacheWrite || 0;
  }
  
  return Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date));
}

function aggregateBySession(allUsage) {
  const bySession = {};
  
  for (const call of allUsage) {
    const sessionId = call.sessionId || 'unknown';
    
    if (!bySession[sessionId]) {
      bySession[sessionId] = {
        sessionId,
        totalCost: 0,
        totalTokens: 0,
        calls: 0,
        firstCall: call.timestamp,
        lastCall: call.timestamp
      };
    }
    
    bySession[sessionId].totalCost += call.cost?.total || 0;
    bySession[sessionId].totalTokens += call.usage?.totalTokens || 0;
    bySession[sessionId].calls += 1;
    
    if (call.timestamp < bySession[sessionId].firstCall) {
      bySession[sessionId].firstCall = call.timestamp;
    }
    if (call.timestamp > bySession[sessionId].lastCall) {
      bySession[sessionId].lastCall = call.timestamp;
    }
  }
  
  return Object.values(bySession).sort((a, b) => b.totalCost - a.totalCost);
}

function printReport(byDate, bySession) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  💰 CLAWDBOT COMPUTE COST REPORT');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Overall totals
  const totalCost = byDate.reduce((sum, d) => sum + d.totalCost, 0);
  const totalTokens = byDate.reduce((sum, d) => sum + d.totalTokens, 0);
  const totalCalls = byDate.reduce((sum, d) => sum + d.calls, 0);
  
  console.log('📈 OVERALL TOTALS');
  console.log(`   Total Cost:   $${totalCost.toFixed(4)}`);
  console.log(`   Total Tokens: ${totalTokens.toLocaleString()}`);
  console.log(`   Total Calls:  ${totalCalls.toLocaleString()}`);
  console.log(`   Avg per Call: $${(totalCost / totalCalls).toFixed(6)}`);
  console.log();
  
  // Daily breakdown (last 7 days)
  console.log('📅 DAILY BREAKDOWN (Last 7 Days)');
  console.log('─────────────────────────────────────────────────────────\n');
  
  for (const day of byDate.slice(0, 7)) {
    console.log(`📆 ${day.date}`);
    console.log(`   Cost:   $${day.totalCost.toFixed(4)}`);
    console.log(`   Tokens: ${day.totalTokens.toLocaleString()}`);
    console.log(`   Calls:  ${day.calls}`);
    
    // Show model breakdown
    const models = Object.entries(day.models)
      .sort((a, b) => b[1].cost - a[1].cost);
    
    for (const [model, stats] of models) {
      const modelName = model.replace('claude-', '').replace('gemini-', '');
      console.log(`      ${modelName}: $${stats.cost.toFixed(4)} (${stats.calls} calls)`);
    }
    console.log();
  }
  
  // Top sessions by cost
  console.log('🔥 TOP 10 SESSIONS BY COST');
  console.log('─────────────────────────────────────────────────────────\n');
  
  for (const session of bySession.slice(0, 10)) {
    const duration = new Date(session.lastCall) - new Date(session.firstCall);
    const durationMin = Math.round(duration / 60000);
    
    console.log(`💬 ${session.sessionId.substring(0, 8)}...`);
    console.log(`   Cost:     $${session.totalCost.toFixed(4)}`);
    console.log(`   Tokens:   ${session.totalTokens.toLocaleString()}`);
    console.log(`   Calls:    ${session.calls}`);
    console.log(`   Duration: ${durationMin} minutes`);
    console.log(`   Started:  ${session.firstCall.split('T')[0]} ${session.firstCall.split('T')[1].split('.')[0]}`);
    console.log();
  }
  
  console.log('═══════════════════════════════════════════════════════════\n');
}

async function main() {
  const allUsage = await aggregateAllSessions();
  const byDate = aggregateByDate(allUsage);
  const bySession = aggregateBySession(allUsage);
  
  printReport(byDate, bySession);
  
  // Save detailed data for dashboard
  const outputFile = path.join(__dirname, '..', 'data', 'cost-data.json');
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  
  fs.writeFileSync(outputFile, JSON.stringify({
    generatedAt: new Date().toISOString(),
    summary: {
      totalCost: byDate.reduce((sum, d) => sum + d.totalCost, 0),
      totalTokens: byDate.reduce((sum, d) => sum + d.totalTokens, 0),
      totalCalls: byDate.reduce((sum, d) => sum + d.calls, 0)
    },
    byDate,
    bySession: bySession.slice(0, 50), // Top 50 sessions
    allUsage: allUsage.slice(0, 1000) // Last 1000 calls for trend analysis
  }, null, 2));
  
  console.log(`💾 Detailed data saved to: ${outputFile}\n`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { parseSessionFile, aggregateAllSessions, aggregateByDate, aggregateBySession };
