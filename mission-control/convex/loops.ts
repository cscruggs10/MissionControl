import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create a loop from a message
 */
export const create = mutation({
  args: {
    channelId: v.id("channels"),
    messageId: v.id("messages"),
    title: v.string(),
    assigneeIds: v.optional(v.array(v.id("agents"))),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const loopId = await ctx.db.insert("loops", {
      channelId: args.channelId,
      messageId: args.messageId,
      title: args.title,
      status: "open",
      assigneeIds: args.assigneeIds || [],
      createdBy: args.createdBy,
      createdAt: now,
    });

    // Notify assigned agents
    if (args.assigneeIds && args.assigneeIds.length > 0) {
      const channel = await ctx.db.get(args.channelId);
      for (const agentId of args.assigneeIds) {
        await ctx.db.insert("notifications", {
          mentionedAgentId: agentId,
          content: `🔴 New loop in #${channel?.name}: ${args.title}`,
          delivered: false,
          channelId: args.channelId,
          messageId: args.messageId,
          createdAt: now,
        });
      }
    }

    // Log activity
    await ctx.db.insert("activities", {
      type: "message_sent",
      message: `Loop opened: ${args.title}`,
      createdAt: now,
    });

    return loopId;
  },
});

/**
 * Close a loop
 */
export const close = mutation({
  args: {
    id: v.id("loops"),
    closedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const loop = await ctx.db.get(args.id);
    if (!loop) {
      throw new Error("Loop not found");
    }

    const now = Date.now();
    await ctx.db.patch(args.id, {
      status: "closed",
      closedBy: args.closedBy,
      closedAt: now,
    });

    // Log activity
    await ctx.db.insert("activities", {
      type: "message_sent",
      message: `✅ Loop closed: ${loop.title}`,
      createdAt: now,
    });

    return args.id;
  },
});

/**
 * Reopen a loop
 */
export const reopen = mutation({
  args: {
    id: v.id("loops"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "open",
      closedBy: undefined,
      closedAt: undefined,
    });

    return args.id;
  },
});

/**
 * List loops for a channel
 */
export const listByChannel = query({
  args: {
    channelId: v.id("channels"),
    status: v.optional(v.union(v.literal("open"), v.literal("closed"))),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("loops")
        .withIndex("by_channel_status", (q) =>
          q.eq("channelId", args.channelId).eq("status", args.status!)
        )
        .order("desc")
        .collect();
    } else {
      return await ctx.db
        .query("loops")
        .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
        .order("desc")
        .collect();
    }
  },
});

/**
 * Get loop by message ID
 */
export const getByMessage = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("loops")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .first();
  },
});

/**
 * Count open loops per channel
 */
export const countOpenByChannel = query({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const openLoops = await ctx.db
      .query("loops")
      .withIndex("by_channel_status", (q) =>
        q.eq("channelId", args.channelId).eq("status", "open")
      )
      .collect();

    return openLoops.length;
  },
});

/**
 * Assign agents to a loop
 */
export const assignAgents = mutation({
  args: {
    id: v.id("loops"),
    agentIds: v.array(v.id("agents")),
  },
  handler: async (ctx, args) => {
    const loop = await ctx.db.get(args.id);
    if (!loop) {
      throw new Error("Loop not found");
    }

    await ctx.db.patch(args.id, {
      assigneeIds: args.agentIds,
    });

    // Notify newly assigned agents
    const now = Date.now();
    const channel = await ctx.db.get(loop.channelId);
    
    for (const agentId of args.agentIds) {
      if (!loop.assigneeIds.includes(agentId)) {
        await ctx.db.insert("notifications", {
          mentionedAgentId: agentId,
          content: `🔴 Assigned to loop in #${channel?.name}: ${loop.title}`,
          delivered: false,
          channelId: loop.channelId,
          messageId: loop.messageId,
          createdAt: now,
        });
      }
    }

    return args.id;
  },
});
