// Channel management - force rebuild
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * List all channels
 */
export const list = query({
  args: {
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const channels = await ctx.db
      .query("channels")
      .withIndex("by_created")
      .order("desc")
      .collect();

    // Filter archived if needed
    if (!args.includeArchived) {
      return channels.filter((c) => !c.archived);
    }

    return channels;
  },
});

/**
 * Get a single channel by ID
 */
export const get = query({
  args: { id: v.id("channels") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get a channel by name
 */
export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("channels")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

/**
 * Create a new channel
 */
export const create = mutation({
  args: {
    name: v.string(),
    emoji: v.optional(v.string()),
    description: v.optional(v.string()),
    agentIds: v.optional(v.array(v.id("agents"))),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if channel name already exists
    const existing = await ctx.db
      .query("channels")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      throw new Error(`Channel "${args.name}" already exists`);
    }

    const channelId = await ctx.db.insert("channels", {
      name: args.name,
      emoji: args.emoji,
      description: args.description,
      agentIds: args.agentIds ?? [],
      createdAt: Date.now(),
      createdBy: args.createdBy,
      archived: false,
    });

    return channelId;
  },
});

/**
 * Update a channel
 */
export const update = mutation({
  args: {
    id: v.id("channels"),
    name: v.optional(v.string()),
    emoji: v.optional(v.string()),
    description: v.optional(v.string()),
    agentIds: v.optional(v.array(v.id("agents"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // If updating name, check for duplicates
    if (updates.name) {
      const existing = await ctx.db
        .query("channels")
        .withIndex("by_name", (q) => q.eq("name", updates.name!))
        .first();

      if (existing && existing._id !== id) {
        throw new Error(`Channel "${updates.name}" already exists`);
      }
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

/**
 * Archive a channel (soft delete)
 */
export const archive = mutation({
  args: { id: v.id("channels") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { archived: true });
    return args.id;
  },
});

/**
 * Unarchive a channel
 */
export const unarchive = mutation({
  args: { id: v.id("channels") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { archived: false });
    return args.id;
  },
});

/**
 * Delete a channel (permanent)
 */
export const remove = mutation({
  args: { id: v.id("channels") },
  handler: async (ctx, args) => {
    // Check if there are tasks in this channel
    const tasksInChannel = await ctx.db
      .query("tasks")
      .withIndex("by_channel", (q) => q.eq("channelId", args.id))
      .collect();

    if (tasksInChannel.length > 0) {
      throw new Error(
        `Cannot delete channel with ${tasksInChannel.length} tasks. Archive it instead or move tasks first.`
      );
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

/**
 * Add an agent to a channel
 */
export const addAgent = mutation({
  args: {
    channelId: v.id("channels"),
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }

    // Check if agent is already in channel
    if (channel.agentIds.includes(args.agentId)) {
      return args.channelId;
    }

    await ctx.db.patch(args.channelId, {
      agentIds: [...channel.agentIds, args.agentId],
    });

    return args.channelId;
  },
});

/**
 * Remove an agent from a channel
 */
export const removeAgent = mutation({
  args: {
    channelId: v.id("channels"),
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }

    await ctx.db.patch(args.channelId, {
      agentIds: channel.agentIds.filter((id) => id !== args.agentId),
    });

    return args.channelId;
  },
});

/**
 * Get all tasks in a channel
 */
export const getTasks = query({
  args: {
    channelId: v.id("channels"),
    status: v.optional(
      v.union(
        v.literal("inbox"),
        v.literal("assigned"),
        v.literal("in_progress"),
        v.literal("review"),
        v.literal("done"),
        v.literal("blocked")
      )
    ),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("tasks")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId));

    const tasks = await query.collect();

    // Filter by status if provided
    if (args.status) {
      return tasks.filter((t) => t.status === args.status);
    }

    return tasks;
  },
});
