"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface DailyCost {
  date: string;
  totalCost: number;
  callCount: number;
  totalTokens: number;
  modelBreakdown?: Record<string, { cost: number; calls: number }>;
}

interface ModelBreakdown {
  model: string;
  cost: number;
  calls: number;
  tokens: number;
}

interface SessionCost {
  sessionId: string;
  totalCost: number;
  callCount: number;
  firstCall: number;
  lastCall: number;
}

export default function CostsPage() {
  const summary = useQuery(api.costTracking.getSummaryStats);
  const dailyCosts = useQuery(api.costTracking.getDailyCosts, { days: 30 });
  const topSessions = useQuery(api.costTracking.getTopSessions, { limit: 10 });
  const modelBreakdown = useQuery(api.costTracking.getModelBreakdown, { days: 7 });
  const spendingAlert = useQuery(api.costTracking.checkSpendingAlert, { dailyThreshold: 50 });

  if (!summary || !dailyCosts || !topSessions || !modelBreakdown) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading cost data...</p>
      </div>
    );
  }

  const getTrendEmoji = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "📈";
      case "decreasing":
        return "📉";
      default:
        return "➡️";
    }
  };

  const getTrendClass = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "bg-red-100 text-red-800 border-red-200";
      case "decreasing":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">💰 Compute Costs</h1>
            <p className="text-gray-500 mt-1">Track API spending and optimize usage</p>
          </div>
          {spendingAlert?.alert && (
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg border border-red-200 flex items-center gap-2">
              <span>⚠️</span>
              <span className="font-medium">
                Daily threshold exceeded: ${spendingAlert.cost.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <span className="text-2xl">💵</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">${summary.totalCost.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Last 24 Hours</p>
              <span className="text-2xl">📅</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">${summary.last24h.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Yesterday + today</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Last 7 Days</p>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">${summary.last7d.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Avg: ${summary.avgPerDay.toFixed(2)}/day</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Trend</p>
              <span className="text-2xl">{getTrendEmoji(summary.trend)}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2 capitalize">{summary.trend}</p>
            <div className={`inline-block px-2 py-1 rounded text-xs font-medium border mt-2 ${getTrendClass(summary.trend)}`}>
              {summary.trend === "increasing" ? "⚠️ Watch usage" : summary.trend === "decreasing" ? "✅ Optimized" : "➡️ Stable"}
            </div>
          </div>
        </div>

        {/* Daily Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Daily Breakdown (Last 30 Days)</h2>
          <div className="space-y-3">
            {dailyCosts.slice(0, 15).map((day: DailyCost) => {
              const models = Object.entries(day.modelBreakdown || {}) as [string, { cost: number; calls: number }][];
              const topModel = models.sort((a, b) => b[1].cost - a[1].cost)[0];
              
              return (
                <div key={day.date} className="flex items-center justify-between border-b border-gray-100 pb-3 hover:bg-gray-50 px-2 rounded transition">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{day.date}</p>
                    <p className="text-xs text-gray-500">
                      {day.callCount.toLocaleString()} calls • {(day.totalTokens / 1000000).toFixed(2)}M tokens
                      {topModel && ` • Mostly ${topModel[0].replace('claude-', '').replace('gemini-', '')}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">${day.totalCost.toFixed(4)}</p>
                    {models.length > 1 && (
                      <p className="text-xs text-gray-500">{models.length} models</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Model Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🤖 Model Breakdown (7 Days)</h2>
            <div className="space-y-3">
              {modelBreakdown.map((model: ModelBreakdown) => {
                const shortName = model.model
                  .replace('claude-', '')
                  .replace('gemini-', '')
                  .replace('sonnet-', 'sonnet ')
                  .replace('haiku-', 'haiku ');
                
                return (
                  <div key={model.model} className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div>
                      <p className="font-medium text-gray-900">{shortName}</p>
                      <p className="text-xs text-gray-500">
                        {model.calls.toLocaleString()} calls • {(model.tokens / 1000000).toFixed(2)}M tokens
                      </p>
                    </div>
                    <p className="font-bold text-gray-900">${model.cost.toFixed(4)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Sessions */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🔥 Top Sessions by Cost</h2>
            <div className="space-y-3">
              {topSessions.map((session: SessionCost, idx: number) => {
                const duration = new Date(session.lastCall).getTime() - new Date(session.firstCall).getTime();
                const durationMin = Math.round(duration / 60000);
                const durationHrs = (durationMin / 60).toFixed(1);
                
                return (
                  <div key={session.sessionId} className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        #{idx + 1} {session.sessionId.substring(0, 8)}...
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.callCount} calls • {durationHrs}h
                      </p>
                    </div>
                    <p className="font-bold text-gray-900">${session.totalCost.toFixed(4)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-sm font-bold text-blue-900 mb-2">
            💡 Optimization Tips
          </p>
          <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
            <li>Use <strong>Claude Haiku</strong> for simple tasks (5x cheaper than Sonnet)</li>
            <li>Prompt caching is already active (reduces costs by ~70-90%)</li>
            <li>Long-running sessions often have better cache hit rates</li>
            <li>Cost spike? Check recent sessions above for outliers</li>
            <li>Current avg: <strong>${summary.avgPerDay.toFixed(2)}/day</strong> • Projected monthly: <strong>${(summary.avgPerDay * 30).toFixed(2)}</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
