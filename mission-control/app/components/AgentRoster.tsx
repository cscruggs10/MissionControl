import type { Doc } from "../../convex/_generated/dataModel";

export function AgentRoster({ agents }: { agents: Doc<"agents">[] }) {
  const statusColors = {
    idle: "bg-gray-100 text-gray-600 border-gray-200",
    active: "bg-green-100 text-green-700 border-green-200",
    working: "bg-purple-100 text-purple-700 border-purple-200",
    blocked: "bg-red-100 text-red-700 border-red-200",
  };

  const statusIcons = {
    idle: "⚪",
    active: "🟢",
    working: "⚡",
    blocked: "🔴",
  };

  return (
    <div className="p-4 h-full">
      <h2 className="text-lg font-bold text-amber-900 mb-4 uppercase tracking-wide flex items-center gap-2">
        <span className="text-xl">⚡</span>
        Agents
        <span className="ml-auto text-sm font-normal bg-amber-100 text-amber-900 px-2 py-1 rounded-full">
          {agents.length}
        </span>
      </h2>

      <div className="space-y-2.5">
        {agents.map((agent) => (
          <div
            key={agent._id}
            className="p-3 rounded-lg border border-amber-200 bg-white hover:border-amber-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{agent.emoji || "🤖"}</span>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-bold text-amber-900 text-sm truncate">
                    {agent.name}
                  </div>
                  <span className="text-lg flex-shrink-0">
                    {statusIcons[agent.status]}
                  </span>
                </div>
                
                <div className="text-xs text-amber-600 mb-2">{agent.role}</div>
                
                <div
                  className={`inline-flex items-center text-xs px-2 py-1 rounded border font-medium uppercase tracking-wide ${
                    statusColors[agent.status]
                  }`}
                >
                  {agent.status}
                </div>
              </div>
            </div>

            {agent.lastHeartbeat && (
              <div className="mt-2 pt-2 border-t border-amber-100 text-xs text-amber-500">
                Last seen: {new Date(agent.lastHeartbeat).toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="text-center text-amber-400 py-12">
          <div className="text-4xl mb-2">😴</div>
          <div className="text-sm font-medium">No agents online</div>
        </div>
      )}
    </div>
  );
}
