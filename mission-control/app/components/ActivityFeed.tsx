import type { Doc } from "../../convex/_generated/dataModel";

export function ActivityFeed({
  activities,
  agents,
  tasks,
}: {
  activities: Doc<"activities">[];
  agents: Doc<"agents">[];
  tasks: Doc<"tasks">[];
}) {
  const getAgentName = (agentId?: string) => {
    const agent = agents.find((a) => a._id === agentId);
    return agent?.name || "System";
  };

  const getAgentEmoji = (agentId?: string) => {
    const agent = agents.find((a) => a._id === agentId);
    return agent?.emoji || "🤖";
  };

  const getTaskTitle = (taskId?: string) => {
    const task = tasks.find((t) => t._id === taskId);
    return task?.title || "Unknown task";
  };

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const activityIcons = {
    task_created: "📝",
    task_updated: "📌",
    task_assigned: "👤",
    message_sent: "💬",
    document_created: "📄",
    agent_heartbeat: "💓",
  };

  const activityColors = {
    task_created: "bg-blue-50 border-blue-200",
    task_updated: "bg-amber-50 border-amber-200",
    task_assigned: "bg-purple-50 border-purple-200",
    message_sent: "bg-green-50 border-green-200",
    document_created: "bg-orange-50 border-orange-200",
    agent_heartbeat: "bg-pink-50 border-pink-200",
  };

  return (
    <div className="p-4 h-full">
      <h2 className="text-lg font-bold text-amber-900 mb-4 uppercase tracking-wide flex items-center gap-2">
        <span className="text-xl">📊</span>
        Live Feed
        <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200 font-normal">
          LIVE
        </span>
      </h2>

      <div className="space-y-2.5">
        {activities.map((activity) => (
          <div
            key={activity._id}
            className={`p-3 rounded-lg border ${
              activityColors[activity.type] || "bg-white border-amber-200"
            } hover:shadow-sm transition-all`}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-xl flex-shrink-0">
                {activityIcons[activity.type] || "📌"}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-amber-900 font-medium mb-1 leading-snug">
                  {activity.message}
                </p>

                {activity.taskId && (
                  <p className="text-xs text-amber-600 mb-2 truncate">
                    → {getTaskTitle(activity.taskId)}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-amber-500">
                  {activity.agentId && (
                    <>
                      <span className="text-sm">{getAgentEmoji(activity.agentId)}</span>
                      <span className="font-medium">{getAgentName(activity.agentId)}</span>
                      <span>·</span>
                    </>
                  )}
                  <span>{timeAgo(activity.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-center text-amber-400 py-12">
            <div className="text-4xl mb-2">🔇</div>
            <div className="text-sm font-medium">No activity yet</div>
          </div>
        )}
      </div>
    </div>
  );
}
