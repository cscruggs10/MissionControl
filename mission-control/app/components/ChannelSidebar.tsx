"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import CreateChannelModal from "./CreateChannelModal";
import { ThemeToggle } from "./ThemeToggle";

function ChannelLoopCount({ channelId }: { channelId: Id<"channels"> }) {
  const openCount = useQuery(api.loops.countOpenByChannel, { channelId });
  
  if (!openCount || openCount === 0) return null;
  
  return (
    <span className="ml-auto bg-nebula-accent text-white text-xs font-semibold px-2 py-0.5 rounded-full">
      {openCount}
    </span>
  );
}

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
      <div className="w-full md:w-64 bg-nebula-surface dark:bg-nebula-dark-surface border-r border-nebula-border dark:border-nebula-dark-border flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-nebula-border dark:border-nebula-dark-border">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg md:text-xl font-semibold text-nebula-text dark:text-nebula-dark-text">Mission Control</h1>
            <ThemeToggle />
          </div>
          
          {/* Loop Creator Quick Link */}
          <div className="flex gap-2">
            <a
              href="/loop-creator"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-nebula-blue hover:opacity-90 text-white text-sm font-medium transition-opacity"
            >
              <span>🔧</span>
              <span>Create Loop</span>
            </a>
            <a
              href="/deal-machine-upload"
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-violet-600 hover:opacity-90 text-white text-sm font-medium transition-opacity"
            >
              <span>🚗</span>
              <span>Upload</span>
            </a>
          </div>
        </div>

        {/* Channels Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold text-nebula-text-muted uppercase tracking-wider">
                Channels
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-nebula-text-light hover:text-nebula-text-muted transition-colors"
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

            {/* Channel List */}
            {channels?.map((channel) => (
              <button
                key={channel._id}
                onClick={() => onSelectChannel(channel._id)}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors active:scale-95 ${
                  selectedChannelId === channel._id
                    ? "bg-nebula-blue text-white"
                    : "text-nebula-text hover:bg-nebula-bg active:bg-nebula-border-light"
                }`}
              >
                <span className="flex items-center gap-3 w-full">
                  <span className="text-xl">
                    {channel.emoji || "#"}
                  </span>
                  <span className="text-sm md:text-base truncate flex-1">{channel.name}</span>
                  <ChannelLoopCount channelId={channel._id} />
                </span>
              </button>
            ))}

            {channels?.length === 0 && (
              <p className="text-nebula-text-light text-xs px-3 py-2">
                No channels yet. Click + to create one.
              </p>
            )}
          </div>

          {/* Agents Section */}
          <div className="p-3 border-t border-nebula-border mt-2">
            <h2 className="text-xs font-semibold text-nebula-text-muted uppercase tracking-wider mb-2">
              Your Agents
            </h2>
            {agents?.map((agent) => (
              <div
                key={agent._id}
                className="flex items-center gap-2 px-3 py-2 text-nebula-text"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    agent.status === "active" || agent.status === "working"
                      ? "bg-nebula-accent"
                      : agent.status === "blocked"
                      ? "bg-red-500"
                      : "bg-nebula-border"
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
