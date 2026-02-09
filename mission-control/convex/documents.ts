import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { taskId: v.optional(v.id("tasks")) },
  handler: async (ctx, args) => {
    if (args.taskId) {
      return await ctx.db
        .query("documents")
        .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("documents")
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("deliverable"),
      v.literal("research"),
      v.literal("protocol"),
      v.literal("notes")
    ),
    taskId: v.optional(v.id("tasks")),
    authorId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const docId = await ctx.db.insert("documents", {
      title: args.title,
      content: args.content,
      type: args.type,
      taskId: args.taskId,
      authorId: args.authorId,
      createdAt: now,
    });

    // Update task timestamp if attached
    if (args.taskId) {
      await ctx.db.patch(args.taskId, {
        updatedAt: now,
      });
    }

    // Log activity
    const author = args.authorId
      ? (await ctx.db.get(args.authorId))?.name
      : "Unknown";
    
    await ctx.db.insert("activities", {
      type: "document_created",
      agentId: args.authorId,
      taskId: args.taskId,
      message: `${author} created ${args.type}: ${args.title}`,
      createdAt: now,
    });

    return docId;
  },
});

export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Document not found");

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.content !== undefined) updates.content = args.content;

    await ctx.db.patch(args.id, updates);

    // Update task timestamp if attached
    if (doc.taskId) {
      await ctx.db.patch(doc.taskId, {
        updatedAt: Date.now(),
      });
    }
  },
});
