import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { 
    agentId: v.id("agents"),
    undeliveredOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("notifications")
      .withIndex("by_agent", (q) => q.eq("mentionedAgentId", args.agentId));
    
    if (args.undeliveredOnly) {
      const all = await query.collect();
      return all.filter(n => !n.delivered);
    }
    
    return await query.order("desc").collect();
  },
});

export const getUndelivered = query({
  args: {},
  handler: async (ctx) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_delivered", (q) => q.eq("delivered", false))
      .collect();
    
    // Join with agent data to get sessionKey
    const withAgents = await Promise.all(
      notifications.map(async (n) => {
        const agent = await ctx.db.get(n.mentionedAgentId);
        return {
          ...n,
          sessionKey: agent?.sessionKey,
          agentName: agent?.name,
        };
      })
    );
    
    return withAgents;
  },
});

export const create = mutation({
  args: {
    mentionedAgentId: v.id("agents"),
    content: v.string(),
    taskId: v.optional(v.id("tasks")),
    messageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("notifications", {
      mentionedAgentId: args.mentionedAgentId,
      content: args.content,
      delivered: false,
      taskId: args.taskId,
      messageId: args.messageId,
      createdAt: now,
    });
  },
});

export const markDelivered = mutation({
  args: {
    id: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      delivered: true,
    });
  },
});

export const markAllDelivered = mutation({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const undelivered = await ctx.db
      .query("notifications")
      .withIndex("by_agent", (q) => q.eq("mentionedAgentId", args.agentId))
      .collect();
    
    for (const notif of undelivered) {
      if (!notif.delivered) {
        await ctx.db.patch(notif._id, { delivered: true });
      }
    }
  },
});
