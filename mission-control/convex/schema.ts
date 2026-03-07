import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    name: v.string(),
    role: v.string(),
    status: v.union(
      v.literal("idle"),
      v.literal("active"),
      v.literal("working"),
      v.literal("blocked")
    ),
    currentTaskId: v.optional(v.id("tasks")),
    sessionKey: v.string(),
    emoji: v.optional(v.string()),
    lastHeartbeat: v.optional(v.number()),
  })
    .index("by_name", ["name"])
    .index("by_session", ["sessionKey"]),

  channels: defineTable({
    name: v.string(),
    emoji: v.optional(v.string()),
    description: v.optional(v.string()),
    agentIds: v.array(v.id("agents")), // Agents assigned to this channel
    createdAt: v.number(),
    createdBy: v.optional(v.string()), // User who created it
    archived: v.optional(v.boolean()),
  })
    .index("by_name", ["name"])
    .index("by_created", ["createdAt"]),

  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    ),
    channelId: v.optional(v.id("channels")), // Link task to a channel
    assigneeIds: v.array(v.id("agents")),
    createdAt: v.number(),
    updatedAt: v.number(),
    dueDate: v.optional(v.number()), // Unix timestamp in milliseconds
    createdBy: v.optional(v.id("agents")),
  })
    .index("by_status", ["status"])
    .index("by_channel", ["channelId"])
    .index("by_updated", ["updatedAt"])
    .index("by_due", ["dueDate"]),

  steps: defineTable({
    taskId: v.id("tasks"),
    title: v.string(),
    description: v.optional(v.string()),
    assigneeId: v.optional(v.id("agents")), // Single agent per step
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("done")
    ),
    order: v.number(), // For sequencing steps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_task", ["taskId"])
    .index("by_task_order", ["taskId", "order"]),

  messages: defineTable({
    taskId: v.optional(v.id("tasks")),
    channelId: v.optional(v.id("channels")),
    fromAgentId: v.optional(v.id("agents")),
    fromUser: v.optional(v.string()), // For human messages
    content: v.string(),
    attachments: v.optional(v.array(v.id("documents"))),
    mediaUrl: v.optional(v.string()), // Cloudinary URL for images/videos
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
    createdAt: v.number(),
  })
    .index("by_task", ["taskId"])
    .index("by_channel", ["channelId"])
    .index("by_created", ["createdAt"]),

  activities: defineTable({
    type: v.union(
      v.literal("task_created"),
      v.literal("task_updated"),
      v.literal("task_assigned"),
      v.literal("message_sent"),
      v.literal("document_created"),
      v.literal("agent_heartbeat")
    ),
    agentId: v.optional(v.id("agents")),
    taskId: v.optional(v.id("tasks")),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),

  documents: defineTable({
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
    createdAt: v.number(),
  })
    .index("by_task", ["taskId"])
    .index("by_created", ["createdAt"]),

  notifications: defineTable({
    mentionedAgentId: v.id("agents"),
    content: v.string(),
    delivered: v.boolean(),
    taskId: v.optional(v.id("tasks")),
    channelId: v.optional(v.id("channels")),
    messageId: v.optional(v.id("messages")),
    createdAt: v.number(),
  })
    .index("by_agent", ["mentionedAgentId"])
    .index("by_delivered", ["delivered"]),

  subscriptions: defineTable({
    taskId: v.id("tasks"),
    agentId: v.id("agents"),
    subscribedAt: v.number(),
  })
    .index("by_task", ["taskId"])
    .index("by_agent", ["agentId"])
    .index("by_task_agent", ["taskId", "agentId"]),

  // Cost Tracking Tables
  apiCalls: defineTable({
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
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_created", ["createdAt"]),

  dailyCostAggregates: defineTable({
    date: v.string(), // YYYY-MM-DD
    totalCost: v.number(),
    totalTokens: v.number(),
    callCount: v.number(),
    modelBreakdown: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_date", ["date"])
    .index("by_updated", ["updatedAt"]),

  sessionCostAggregates: defineTable({
    sessionId: v.string(),
    totalCost: v.number(),
    totalTokens: v.number(),
    callCount: v.number(),
    firstCall: v.string(),
    lastCall: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_cost", ["totalCost"])
    .index("by_updated", ["updatedAt"]),

  loops: defineTable({
    channelId: v.id("channels"),
    messageId: v.id("messages"), // The original request message
    title: v.string(),
    status: v.union(v.literal("open"), v.literal("closed")),
    assigneeIds: v.array(v.id("agents")),
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
    closedBy: v.optional(v.string()),
    closedAt: v.optional(v.number()),
  })
    .index("by_channel", ["channelId"])
    .index("by_status", ["status"])
    .index("by_channel_status", ["channelId", "status"])
    .index("by_message", ["messageId"]),
});
