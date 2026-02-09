import type { Doc } from "../../convex/_generated/dataModel";

export function AgentRoster({ agents }: { agents: Doc<"agents">[] }) {
  const statusColors = {
    idle: "bg-gray-200 text-gray-600",
    active: "bg-green-200 text-green-700",
    blocked: "bg-red-200 text-red-700",
  };

  return (
    <div className="bg-white rounded-lg border border-amber-200 p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-bold text-amber-900 mb-4 uppercase tracking-wide">
        ⚡ Agents
        <span className="ml-2 text-sm font-normal text-amber-600">
          {agents.length}
        </span>
      </h2>

      <div className="space-y-3">
        {agents.map((agent) => (
          <div
            key={agent._id}
            className="p-3 rounded-lg border border-amber-100 hover:border-amber-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{agent.emoji || "🤖"}</span>
                  <div>
                    <div className="font-bold text-amber-900 text-sm">
                      {agent.name}
                    </div>
                    <div className="text-xs text-amber-600">{agent.role}</div>
                  </div>
                </div>
              </div>

              <div
                className={`text-xs px-2 py-1 rounded-full uppercase tracking-wide font-medium ${
                  statusColors[agent.status]
                }`}
              >
                {agent.status}
              </div>
            </div>

            {agent.lastHeartbeat && (
              <div className="mt-2 text-xs text-amber-500">
                Last seen:{" "}
                {new Date(agent.lastHeartbeat).toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="text-center text-amber-500 py-8">
          No agents online
        </div>
      )}
    </div>
  );
}
