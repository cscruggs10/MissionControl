"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";

export function TaskDetail({
  task,
  agents,
  onClose,
}: {
  task: Doc<"tasks">;
  agents: Doc<"agents">[];
  onClose: () => void;
}) {
  const messages = useQuery(api.messages.listByTask, { taskId: task._id });

  const assignedAgents = agents.filter((a) =>
    task.assigneeIds.includes(a._id as Id<"agents">)
  );

  const getAgentById = (id?: Id<"agents">) => {
    return agents.find((a) => a._id === id);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusColors: Record<string, string> = {
    inbox: "bg-amber-100 text-amber-800",
    assigned: "bg-blue-100 text-blue-800",
    in_progress: "bg-purple-100 text-purple-800",
    review: "bg-orange-100 text-orange-800",
    done: "bg-green-100 text-green-800",
    blocked: "bg-red-100 text-red-800",
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-amber-200 p-4 md:p-6">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <h2 className="text-lg md:text-2xl font-bold text-amber-900 flex-1 pr-4">
              {task.title}
            </h2>
            <button
              onClick={onClose}
              className="text-amber-600 hover:text-amber-900 text-3xl font-bold leading-none"
            >
              ×
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                statusColors[task.status]
              }`}
            >
              {task.status.replace("_", " ")}
            </span>

            {assignedAgents.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-amber-600">Assigned to:</span>
                {assignedAgents.map((agent) => (
                  <div
                    key={agent._id}
                    className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full"
                  >
                    <span className="text-sm">{agent.emoji || "🤖"}</span>
                    <span className="text-xs font-medium text-amber-900">
                      {agent.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide mb-2">
              Description
            </h3>
            <p className="text-amber-800 whitespace-pre-wrap">
              {task.description}
            </p>
          </div>

          {/* Comments Thread */}
          <div>
            <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide mb-4">
              Activity ({messages?.length || 0})
            </h3>

            {messages && messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const author = msg.fromAgentId
                    ? getAgentById(msg.fromAgentId as Id<"agents">)
                    : null;
                  const displayName = author?.name || msg.fromUser || "System";
                  const emoji = author?.emoji || "👤";

                  return (
                    <div
                      key={msg._id}
                      className="bg-amber-50 rounded-lg p-4 border border-amber-100"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-lg flex-shrink-0">
                          {emoji}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="font-bold text-amber-900">
                              {displayName}
                            </span>
                            <span className="text-xs text-amber-500">
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>

                          <p className="text-amber-800 whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-amber-500 text-center py-8">
                No comments yet
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-amber-200 p-4 bg-amber-50">
          <div className="flex items-center justify-between text-xs text-amber-600">
            <span>Created {formatTime(task.createdAt)}</span>
            <span>Updated {formatTime(task.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
