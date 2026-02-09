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
    assigneeIds: v.array(v.id("agents")),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.id("agents")),
  })
    .index("by_status", ["status"])
    .index("by_updated", ["updatedAt"]),

  messages: defineTable({
    taskId: v.id("tasks"),
    fromAgentId: v.optional(v.id("agents")),
    fromUser: v.optional(v.string()), // For human messages
    content: v.string(),
    attachments: v.optional(v.array(v.id("documents"))),
    createdAt: v.number(),
  })
    .index("by_task", ["taskId"])
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
});
