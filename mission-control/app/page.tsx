"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import ChannelSidebar from "./components/ChannelSidebar";
import { ChannelView } from "./components/ChannelView";
import { AgentRoster } from "./components/AgentRoster";

export default function Home() {
  const [selectedChannelId, setSelectedChannelId] = useState<
    Id<"channels"> | undefined
  >(undefined);
  const [showAgents, setShowAgents] = useState(false);
  
  const agents = useQuery(api.agents.list, {});

  if (!agents) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-stone-500">Loading Mission Control...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex h-screen overflow-hidden">
      {/* Channel Sidebar - Hidden on mobile when channel selected */}
      <div className={`${selectedChannelId ? 'hidden md:flex' : 'flex'}`}>
        <ChannelSidebar
          selectedChannelId={selectedChannelId}
          onSelectChannel={setSelectedChannelId}
        />
      </div>

      {/* Main Channel View */}
      <div className={`flex-1 ${selectedChannelId ? 'flex' : 'hidden md:flex'}`}>
        <ChannelView 
          channelId={selectedChannelId} 
          agents={agents}
          onBack={() => setSelectedChannelId(undefined)}
        />
      </div>

      {/* Right Sidebar - Agents (optional, can toggle) */}
      {showAgents && (
        <aside className="w-80 border-l border-stone-200 bg-stone-50 overflow-y-auto">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <h2 className="text-stone-900 font-bold">Agents</h2>
            <button
              onClick={() => setShowAgents(false)}
              className="text-stone-400 hover:text-stone-600"
            >
              ✕
            </button>
          </div>
          <AgentRoster agents={agents} />
        </aside>
      )}

      {/* Toggle Agents Button (if hidden) */}
      {!showAgents && (
        <button
          onClick={() => setShowAgents(true)}
          className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-50"
          title="Show Agents"
        >
          <span className="text-xl">👥</span>
        </button>
      )}
    </div>
  );
}
