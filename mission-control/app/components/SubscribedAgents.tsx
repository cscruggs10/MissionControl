"use client";

import { Id } from "../../convex/_generated/dataModel";

interface Agent {
  _id: Id<"agents">;
  name: string;
  role: string;
  emoji?: string;
}

interface SubscribedAgentsProps {
  agents: Agent[];
}

export default function SubscribedAgents({ agents }: SubscribedAgentsProps) {
  if (agents.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-850 px-3 py-2 rounded-lg">
      <span className="flex items-center gap-1">
        <span>🔔</span>
        <span className="font-medium">Subscribed:</span>
      </span>
      <div className="flex gap-1 flex-wrap">
        {agents.map((agent) => (
          <span
            key={agent._id}
            className="bg-gray-800 px-2 py-0.5 rounded flex items-center gap-1"
          >
            <span>{agent.emoji || "👤"}</span>
            <span>{agent.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
