export function Header({
  agentsCount,
  tasksInQueue,
}: {
  agentsCount: number;
  tasksInQueue: number;
}) {
  return (
    <header className="border-b border-amber-200 bg-white px-4 md:px-6 py-3 md:py-4">
      {/* Mobile: Stack vertically */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-amber-900">
            🎯 MISSION CONTROL
          </h1>
          <span className="text-xs text-amber-600 font-medium px-2 py-1 bg-amber-100 rounded-full">
            LIVE
          </span>
        </div>

        <div className="flex items-center justify-around">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-900">
              {agentsCount}
            </div>
            <div className="text-xs text-amber-600 uppercase tracking-wide">
              Agents
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-amber-900">
              {tasksInQueue}
            </div>
            <div className="text-xs text-amber-600 uppercase tracking-wide">
              Tasks
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-amber-600">
              {new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </div>
            <div className="text-xs text-amber-500">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Horizontal layout */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-amber-900">
            🎯 MISSION CONTROL
          </h1>
          <span className="text-sm text-amber-600 font-medium px-3 py-1 bg-amber-100 rounded-full">
            LIVE
          </span>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-900">
              {agentsCount}
            </div>
            <div className="text-xs text-amber-600 uppercase tracking-wide">
              Agents Active
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-amber-900">
              {tasksInQueue}
            </div>
            <div className="text-xs text-amber-600 uppercase tracking-wide">
              Tasks in Queue
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-amber-600">
              {new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </div>
            <div className="text-xs text-amber-500">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
