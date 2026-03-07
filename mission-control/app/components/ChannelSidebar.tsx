"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import CreateChannelModal from "./CreateChannelModal";

interface ChannelSidebarProps {
  selectedChannelId?: Id<"channels">;
  onSelectChannel: (channelId?: Id<"channels">) => void;
}

export default function ChannelSidebar({
  selectedChannelId,
  onSelectChannel,
}: ChannelSidebarProps) {
  const channels = useQuery(api.channels.list, {});
  const agents = useQuery(api.agents.list, {});
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">Mission Control</h1>
        </div>

        {/* Channels Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Channels
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Create Channel"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>

            {/* All Tasks (no channel filter) */}
            <button
              onClick={() => onSelectChannel(undefined)}
              className={`w-full text-left px-3 py-2 rounded-md mb-1 transition-colors ${
                selectedChannelId === undefined
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">#</span>
                <span className="text-sm">all-tasks</span>
              </span>
            </button>

            {/* Channel List */}
            {channels?.map((channel) => (
              <button
                key={channel._id}
                onClick={() => onSelectChannel(channel._id)}
                className={`w-full text-left px-3 py-2 rounded-md mb-1 transition-colors ${
                  selectedChannelId === channel._id
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">
                    {channel.emoji || "#"}
                  </span>
                  <span className="text-sm truncate">{channel.name}</span>
                </span>
              </button>
            ))}

            {channels?.length === 0 && (
              <p className="text-gray-500 text-xs px-3 py-2">
                No channels yet. Click + to create one.
              </p>
            )}
          </div>

          {/* Agents Section */}
          <div className="p-3 border-t border-gray-800 mt-2">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Your Agents
            </h2>
            {agents?.map((agent) => (
              <div
                key={agent._id}
                className="flex items-center gap-2 px-3 py-2 text-gray-300"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    agent.status === "active" || agent.status === "working"
                      ? "bg-green-500"
                      : agent.status === "blocked"
                      ? "bg-red-500"
                      : "bg-gray-500"
                  }`}
                />
                <span className="text-lg">{agent.emoji || "🤖"}</span>
                <span className="text-sm truncate">{agent.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Channel Modal */}
      {showCreateModal && (
        <CreateChannelModal
          agents={agents || []}
          onClose={() => setShowCreateModal(false)}
          onCreated={(channelId) => {
            setShowCreateModal(false);
            onSelectChannel(channelId);
          }}
        />
      )}
    </>
  );
}
