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

  return (
    <div className="bg-white rounded-lg border border-amber-200 p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-bold text-amber-900 mb-4 uppercase tracking-wide">
        📊 LIVE FEED
      </h2>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity._id}
            className="pb-3 border-b border-amber-100 last:border-0"
          >
            <div className="flex items-start gap-2">
              <span className="text-lg flex-shrink-0">
                {activityIcons[activity.type]}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-amber-900 mb-1">
                  {activity.message}
                </p>

                {activity.taskId && (
                  <p className="text-xs text-amber-600 mb-1 truncate">
                    → {getTaskTitle(activity.taskId)}
                  </p>
                )}

                <div className="text-xs text-amber-500">
                  {activity.agentId && (
                    <span>{getAgentName(activity.agentId)} · </span>
                  )}
                  {timeAgo(activity.createdAt)}
                </div>
              </div>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-center text-amber-500 py-8">
            No activity yet
          </div>
        )}
      </div>
    </div>
  );
}
