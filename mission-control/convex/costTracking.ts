import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Cost Tracking Schema
 * Stores API usage costs for monitoring and optimization
 */

// Store individual API calls for detailed analysis
export const logApiCall = mutation({
  args: {
    sessionId: v.string(),
    timestamp: v.string(),
    model: v.string(),
    provider: v.string(),
    usage: v.object({
      input: v.number(),
      output: v.number(),
      cacheRead: v.optional(v.number()),
      cacheWrite: v.optional(v.number()),
      totalTokens: v.number(),
    }),
    cost: v.object({
      input: v.number(),
      output: v.number(),
      cacheRead: v.optional(v.number()),
      cacheWrite: v.optional(v.number()),
      total: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("apiCalls", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Store daily aggregates for quick dashboard queries
export const updateDailyAggregate = mutation({
  args: {
    date: v.string(), // YYYY-MM-DD
    totalCost: v.number(),
    totalTokens: v.number(),
    callCount: v.number(),
    modelBreakdown: v.any(), // Object with model stats
  },
  handler: async (ctx, args) => {
    // Check if aggregate exists for this date
    const existing = await ctx.db
      .query("dailyCostAggregates")
      .filter((q) => q.eq(q.field("date"), args.date))
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        totalCost: args.totalCost,
        totalTokens: args.totalTokens,
        callCount: args.callCount,
        modelBreakdown: args.modelBreakdown,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      // Create new
      return await ctx.db.insert("dailyCostAggregates", {
        ...args,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Store session aggregates
export const updateSessionAggregate = mutation({
  args: {
    sessionId: v.string(),
    totalCost: v.number(),
    totalTokens: v.number(),
    callCount: v.number(),
    firstCall: v.string(),
    lastCall: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("sessionCostAggregates")
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        totalCost: args.totalCost,
        totalTokens: args.totalTokens,
        callCount: args.callCount,
        lastCall: args.lastCall,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("sessionCostAggregates", {
        ...args,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Query: Get daily costs for last N days
export const getDailyCosts = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, { days = 30 }) => {
    const results = await ctx.db
      .query("dailyCostAggregates")
      .order("desc")
      .take(days);

    return results.sort((a, b) => b.date.localeCompare(a.date));
  },
});

// Query: Get summary stats
export const getSummaryStats = query({
  handler: async (ctx) => {
    const dailyData = await ctx.db
      .query("dailyCostAggregates")
      .order("desc")
      .take(90);

    if (dailyData.length === 0) {
      return {
        totalCost: 0,
        last24h: 0,
        last7d: 0,
        last30d: 0,
        avgPerDay: 0,
        trend: "stable",
      };
    }

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7 = new Date(now);
    last7.setDate(last7.getDate() - 7);
    const last30 = new Date(now);
    last30.setDate(last30.getDate() - 30);

    const todayStr = now.toISOString().split("T")[0];
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let last24h = 0;
    let last7d = 0;
    let last30d = 0;
    let totalCost = 0;

    for (const day of dailyData) {
      totalCost += day.totalCost;

      if (day.date === todayStr || day.date === yesterdayStr) {
        last24h += day.totalCost;
      }
      if (day.date >= last7.toISOString().split("T")[0]) {
        last7d += day.totalCost;
      }
      if (day.date >= last30.toISOString().split("T")[0]) {
        last30d += day.totalCost;
      }
    }

    const avgPerDay = last30d / Math.min(30, dailyData.length);

    // Calculate trend
    const recentAvg = dailyData.slice(0, 7).reduce((sum, d) => sum + d.totalCost, 0) / 7;
    const olderAvg = dailyData.slice(7, 14).reduce((sum, d) => sum + d.totalCost, 0) / 7;
    const trend = recentAvg > olderAvg * 1.2 ? "increasing" : recentAvg < olderAvg * 0.8 ? "decreasing" : "stable";

    return {
      totalCost,
      last24h,
      last7d,
      last30d,
      avgPerDay,
      trend,
    };
  },
});

// Query: Get top sessions by cost
export const getTopSessions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 10 }) => {
    return await ctx.db
      .query("sessionCostAggregates")
      .order("desc")
      .take(limit);
  },
});

// Query: Get model breakdown
export const getModelBreakdown = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, { days = 7 }) => {
    const dailyData = await ctx.db
      .query("dailyCostAggregates")
      .order("desc")
      .take(days);

    const modelTotals: Record<string, { cost: number; calls: number; tokens: number }> = {};

    for (const day of dailyData) {
      if (day.modelBreakdown) {
        for (const [model, stats] of Object.entries(day.modelBreakdown)) {
          if (!modelTotals[model]) {
            modelTotals[model] = { cost: 0, calls: 0, tokens: 0 };
          }
          modelTotals[model].cost += (stats as any).cost;
          modelTotals[model].calls += (stats as any).calls;
          modelTotals[model].tokens += (stats as any).tokens;
        }
      }
    }

    return Object.entries(modelTotals)
      .map(([model, stats]) => ({ model, ...stats }))
      .sort((a, b) => b.cost - a.cost);
  },
});

// Query: Check if spending is above threshold
export const checkSpendingAlert = query({
  args: {
    dailyThreshold: v.optional(v.number()),
  },
  handler: async (ctx, { dailyThreshold = 50 }) => {
    const today = new Date().toISOString().split("T")[0];
    const todayData = await ctx.db
      .query("dailyCostAggregates")
      .filter((q) => q.eq(q.field("date"), today))
      .first();

    if (!todayData) {
      return { alert: false, cost: 0, threshold: dailyThreshold };
    }

    return {
      alert: todayData.totalCost > dailyThreshold,
      cost: todayData.totalCost,
      threshold: dailyThreshold,
      percentOfThreshold: (todayData.totalCost / dailyThreshold) * 100,
    };
  },
});
