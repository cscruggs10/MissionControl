"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface Agent {
  _id: Id<"agents">;
  name: string;
  emoji?: string;
}

interface CreateChannelModalProps {
  agents: Agent[];
  onClose: () => void;
  onCreated: (channelId: Id<"channels">) => void;
}

export default function CreateChannelModal({
  agents,
  onClose,
  onCreated,
}: CreateChannelModalProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAgentIds, setSelectedAgentIds] = useState<Id<"agents">[]>([]);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const createChannel = useMutation(api.channels.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Channel name is required");
      return;
    }

    setIsCreating(true);

    try {
      const channelId = await createChannel({
        name: name.trim(),
        emoji: emoji.trim() || undefined,
        description: description.trim() || undefined,
        agentIds: selectedAgentIds,
        createdBy: "system", // TODO: Add actual user tracking
      });

      onCreated(channelId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create channel");
      setIsCreating(false);
    }
  };

  const toggleAgent = (agentId: Id<"agents">) => {
    setSelectedAgentIds((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-lg w-full border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Create Channel</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Channel Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Channel Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., marketing, product, sales"
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Emoji */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Emoji (optional)
            </label>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="📱 💼 🎨 ⚡"
              maxLength={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this channel for?"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Assign Agents */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Assign Agents (optional)
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto bg-gray-800 border border-gray-700 rounded-md p-3">
              {agents.map((agent) => (
                <label
                  key={agent._id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-700 p-2 rounded-md transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedAgentIds.includes(agent._id)}
                    onChange={() => toggleAgent(agent._id)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-lg">{agent.emoji || "🤖"}</span>
                  <span className="text-sm text-gray-300">{agent.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? "Creating..." : "Create Channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
