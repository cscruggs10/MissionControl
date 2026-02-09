"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface Task {
  _id: Id<"tasks">;
  title: string;
  description: string;
  status: string;
  assigneeIds: Id<"agents">[];
  createdAt: number;
  updatedAt: number;
}

interface Agent {
  _id: Id<"agents">;
  name: string;
  role: string;
  emoji?: string;
}

interface TaskModalProps {
  task: Task;
  agents: Agent[];
  onClose: () => void;
}

export default function TaskModal({ task, agents, onClose }: TaskModalProps) {
  const [status, setStatus] = useState(task.status);
  const [selectedAgents, setSelectedAgents] = useState<Id<"agents">[]>(task.assigneeIds);
  const [commentText, setCommentText] = useState("");
  const [selectedCommentAgent, setSelectedCommentAgent] = useState<string>("");

  const messages = useQuery(api.messages.listByTask, { taskId: task._id });
  const updateStatus = useMutation(api.tasks.updateStatus);
  const assign = useMutation(api.tasks.assign);
  const createMessage = useMutation(api.messages.create);

  const statuses = [
    { value: "inbox", label: "Inbox", icon: "📥" },
    { value: "assigned", label: "Assigned", icon: "📌" },
    { value: "in_progress", label: "In Progress", icon: "🔄" },
    { value: "review", label: "Review", icon: "👀" },
    { value: "done", label: "Done", icon: "✅" },
    { value: "blocked", label: "Blocked", icon: "🚫" },
  ];

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-pink-500",
      "bg-blue-500",
      "bg-cyan-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-yellow-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const toggleAgent = (agentId: Id<"agents">) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleSave = async () => {
    try {
      await updateStatus({ id: task._id, status: status as any });
      await assign({ id: task._id, agentIds: selectedAgents });
      onClose();
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    const fromAgentId = selectedCommentAgent
      ? (selectedCommentAgent as Id<"agents">)
      : undefined;

    try {
      await createMessage({
        taskId: task._id,
        content: commentText,
        fromAgentId,
        fromUser: !fromAgentId ? "Corey" : undefined,
      });
      setCommentText("");
      setSelectedCommentAgent("");
    } catch (error) {
      console.error("Failed to send comment:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-800">
        <div className="p-6">
          {/* Task Description */}
          <div className="mb-6 text-gray-300 leading-relaxed">
            {task.description}
          </div>

          {/* Status */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Status</h3>
            <div className="flex flex-wrap gap-2">
              {statuses.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatus(s.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    status === s.value
                      ? s.value === "done"
                        ? "bg-green-600 text-white"
                        : s.value === "blocked"
                        ? "bg-red-600 text-white"
                        : "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-750"
                  }`}
                >
                  <span className="mr-1">{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Assign to Agents */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">
              Assign to Agents
            </h3>
            <div className="space-y-2">
              {agents.map((agent) => (
                <button
                  key={agent._id}
                  onClick={() => toggleAgent(agent._id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    selectedAgents.includes(agent._id)
                      ? "bg-gray-800 border border-blue-500"
                      : "bg-gray-850 border border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(
                      agent.name
                    )}`}
                  >
                    {agent.emoji || agent.name[0].toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-gray-400">{agent.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Comments & Output */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">
              Comments & Output
            </h3>
            <div className="bg-gray-850 rounded-lg p-4 mb-3 min-h-[100px] max-h-[200px] overflow-y-auto">
              {!messages || messages.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No comments yet</p>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg._id} className="text-sm">
                      <span className="font-semibold text-blue-400">
                        {msg.fromUser || "Agent"}:
                      </span>{" "}
                      <span className="text-gray-300">{msg.content}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCommentAgent}
                onChange={(e) => setSelectedCommentAgent(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select agent...</option>
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendComment()}
                placeholder="Add a comment..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />

              <button
                onClick={handleSendComment}
                disabled={!commentText.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Send
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
