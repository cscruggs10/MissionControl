import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("asc")
      .collect();
  },
});

export const listByChannel = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("asc")
      .collect();
  },
});

export const listByLoop = query({
  args: { loopId: v.id("loops") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_loop", (q) => q.eq("loopId", args.loopId))
      .order("asc")
      .collect();
  },
});

export const create = mutation({
  args: {
    taskId: v.id("tasks"),
    content: v.string(),
    fromAgentId: v.optional(v.id("agents")),
    fromUser: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const messageId = await ctx.db.insert("messages", {
      taskId: args.taskId,
      fromAgentId: args.fromAgentId,
      fromUser: args.fromUser,
      content: args.content,
      mediaUrl: args.mediaUrl,
      mediaType: args.mediaType,
      createdAt: now,
    });

    // Update task timestamp
    await ctx.db.patch(args.taskId, {
      updatedAt: now,
    });

    // Auto-subscribe the commenter
    if (args.fromAgentId) {
      const agentId = args.fromAgentId;
      const existingSub = await ctx.db
        .query("subscriptions")
        .withIndex("by_task_agent", (q) =>
          q.eq("taskId", args.taskId).eq("agentId", agentId)
        )
        .first();
      
      if (!existingSub) {
        await ctx.db.insert("subscriptions", {
          taskId: args.taskId,
          agentId: agentId,
          subscribedAt: now,
        });
      }
    }

    // Parse @mentions
    const mentionRegex = /@(\w+)/g;
    const mentions = [...args.content.matchAll(mentionRegex)].map(m => m[1].toLowerCase());
    
    // Get all agents for lookup
    const allAgents = await ctx.db.query("agents").collect();
    const agentsByName = new Map(allAgents.map(a => [a.name.toLowerCase(), a]));
    
    // Collect agents to notify
    const toNotify = new Set<string>();
    
    // Handle @mentions
    for (const mention of mentions) {
      if (mention === "all") {
        // @all = notify everyone
        allAgents.forEach(a => toNotify.add(a._id));
      } else {
        const agent = agentsByName.get(mention);
        if (agent) {
          toNotify.add(agent._id);
          // Auto-subscribe mentioned agents
          const existingSub = await ctx.db
            .query("subscriptions")
            .withIndex("by_task_agent", (q) =>
              q.eq("taskId", args.taskId).eq("agentId", agent._id)
            )
            .first();
          if (!existingSub) {
            await ctx.db.insert("subscriptions", {
              taskId: args.taskId,
              agentId: agent._id,
              subscribedAt: now,
            });
          }
        }
      }
    }
    
    // Also notify all subscribers
    const subscribers = await ctx.db
      .query("subscriptions")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
    
    subscribers.forEach(sub => toNotify.add(sub.agentId));
    
    // Don't notify the author
    if (args.fromAgentId) {
      toNotify.delete(args.fromAgentId);
    }
    
    // Create notifications
    const task = await ctx.db.get(args.taskId);
    const author = args.fromAgentId
      ? (await ctx.db.get(args.fromAgentId))?.name
      : args.fromUser || "Unknown";
    
    for (const agentId of toNotify) {
      await ctx.db.insert("notifications", {
        mentionedAgentId: agentId as any,
        content: `💬 ${author} commented on "${task?.title}":\n${args.content}`,
        delivered: false,
        taskId: args.taskId,
        messageId,
        createdAt: now,
      });
    }

    // Log activity
    await ctx.db.insert("activities", {
      type: "message_sent",
      agentId: args.fromAgentId,
      taskId: args.taskId,
      message: `${author} commented`,
      createdAt: now,
    });

    return messageId;
  },
});

export const createInChannel = mutation({
  args: {
    channelId: v.id("channels"),
    loopId: v.optional(v.id("loops")),
    content: v.string(),
    fromAgentId: v.optional(v.id("agents")),
    fromUser: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const messageId = await ctx.db.insert("messages", {
      channelId: args.channelId,
      loopId: args.loopId,
      fromAgentId: args.fromAgentId,
      fromUser: args.fromUser,
      content: args.content,
      mediaUrl: args.mediaUrl,
      mediaType: args.mediaType,
      createdAt: now,
    });

    // Parse @mentions
    const mentionRegex = /@(\w+)/g;
    const mentions = [...args.content.matchAll(mentionRegex)].map(m => m[1].toLowerCase());
    
    // Get all agents for lookup
    const allAgents = await ctx.db.query("agents").collect();
    const agentsByName = new Map(allAgents.map(a => [a.name.toLowerCase(), a]));
    
    // Get channel to see which agents are subscribed
    const channel = await ctx.db.get(args.channelId);
    const channelAgentIds = new Set(channel?.agentIds || []);
    
    // Collect agents to notify
    const toNotify = new Set<string>();
    
    // Handle @mentions
    for (const mention of mentions) {
      if (mention === "all") {
        // @all = notify all agents in this channel
        channelAgentIds.forEach(id => toNotify.add(id));
      } else {
        const agent = agentsByName.get(mention);
        if (agent && channelAgentIds.has(agent._id)) {
          toNotify.add(agent._id);
        }
      }
    }
    
    // If no specific mentions, notify all agents in the channel
    if (mentions.length === 0) {
      channelAgentIds.forEach(id => toNotify.add(id));
    }
    
    // Don't notify the author
    if (args.fromAgentId) {
      toNotify.delete(args.fromAgentId);
    }
    
    // Create notifications
    const author = args.fromAgentId
      ? (await ctx.db.get(args.fromAgentId))?.name
      : args.fromUser || "Unknown";
    
    for (const agentId of toNotify) {
      await ctx.db.insert("notifications", {
        mentionedAgentId: agentId as any,
        content: `💬 ${author} in #${channel?.name}:\n${args.content}`,
        delivered: false,
        channelId: args.channelId,
        messageId,
        createdAt: now,
      });
    }

    // Log activity
    await ctx.db.insert("activities", {
      type: "message_sent",
      agentId: args.fromAgentId,
      message: `${author} posted in #${channel?.name}`,
      createdAt: now,
    });

    return messageId;
  },
});
