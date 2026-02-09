import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { 
    taskId: v.optional(v.id("tasks")),
    agentId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    if (args.taskId) {
      const taskId = args.taskId;
      return await ctx.db
        .query("subscriptions")
        .withIndex("by_task", (q) => q.eq("taskId", taskId))
        .collect();
    }
    if (args.agentId) {
      const agentId = args.agentId;
      return await ctx.db
        .query("subscriptions")
        .withIndex("by_agent", (q) => q.eq("agentId", agentId))
        .collect();
    }
    return [];
  },
});

export const subscribe = mutation({
  args: {
    taskId: v.id("tasks"),
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_task_agent", (q) =>
        q.eq("taskId", args.taskId).eq("agentId", args.agentId)
      )
      .first();
    
    if (existing) {
      return existing._id;
    }
    
    return await ctx.db.insert("subscriptions", {
      taskId: args.taskId,
      agentId: args.agentId,
      subscribedAt: Date.now(),
    });
  },
});

export const unsubscribe = mutation({
  args: {
    taskId: v.id("tasks"),
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_task_agent", (q) =>
        q.eq("taskId", args.taskId).eq("agentId", args.agentId)
      )
      .first();
    
    if (subscription) {
      await ctx.db.delete(subscription._id);
    }
  },
});
