import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("tasks").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    assigneeIds: v.optional(v.array(v.id("agents"))),
    createdBy: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: "inbox",
      assigneeIds: args.assigneeIds || [],
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
    });

    // Log activity
    await ctx.db.insert("activities", {
      type: "task_created",
      taskId,
      message: `Task created: ${args.title}`,
      createdAt: now,
    });

    return taskId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    ),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // Log activity
    await ctx.db.insert("activities", {
      type: "task_updated",
      taskId: args.id,
      message: `Task moved to ${args.status}: ${task.title}`,
      createdAt: Date.now(),
    });
  },
});

export const assign = mutation({
  args: {
    id: v.id("tasks"),
    agentIds: v.array(v.id("agents")),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");

    const now = Date.now();

    await ctx.db.patch(args.id, {
      assigneeIds: args.agentIds,
      status: args.agentIds.length > 0 ? "assigned" : "inbox",
      updatedAt: now,
    });

    // Auto-subscribe assigned agents
    for (const agentId of args.agentIds) {
      const existingSub = await ctx.db
        .query("subscriptions")
        .withIndex("by_task_agent", (q) =>
          q.eq("taskId", args.id).eq("agentId", agentId)
        )
        .first();
      
      if (!existingSub) {
        await ctx.db.insert("subscriptions", {
          taskId: args.id,
          agentId,
          subscribedAt: now,
        });
      }
    }

    // Log activity
    await ctx.db.insert("activities", {
      type: "task_assigned",
      taskId: args.id,
      message: `Task assigned: ${task.title}`,
      createdAt: now,
    });
  },
});
