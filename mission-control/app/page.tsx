"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Header } from "./components/Header";
import { AgentRoster } from "./components/AgentRoster";
import { TaskBoard } from "./components/TaskBoard";
import { ActivityFeed } from "./components/ActivityFeed";

type MobileView = "tasks" | "agents" | "activity";

export default function Home() {
  const [mobileView, setMobileView] = useState<MobileView>("tasks");
  const tasks = useQuery(api.tasks.list, {});
  const agents = useQuery(api.agents.list, {});
  const activities = useQuery(api.activities.list, { limit: 50 });

  if (!tasks || !agents || !activities) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-amber-600">Loading Mission Control...</div>
      </div>
    );
  }

  // Group tasks by status
  const tasksByStatus = {
    inbox: tasks.filter((t) => t.status === "inbox"),
    assigned: tasks.filter((t) => t.status === "assigned"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    review: tasks.filter((t) => t.status === "review"),
    done: tasks.filter((t) => t.status === "done"),
  };

  const tasksInQueue = tasks.filter((t) => t.status !== "done").length;

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header agentsCount={agents.length} tasksInQueue={tasksInQueue} />

      {/* Desktop: 3-Column Layout */}
      <div className="hidden lg:flex h-[calc(100vh-80px)]">
        {/* Left: Agent Roster */}
        <aside className="w-64 xl:w-72 border-r border-amber-200 bg-white overflow-y-auto">
          <AgentRoster agents={agents} />
        </aside>

        {/* Center: Task Board */}
        <main className="flex-1 overflow-hidden">
          <TaskBoard tasksByStatus={tasksByStatus} agents={agents} />
        </main>

        {/* Right: Activity Feed */}
        <aside className="w-80 xl:w-96 border-l border-amber-200 bg-white overflow-y-auto">
          <ActivityFeed activities={activities} agents={agents} tasks={tasks} />
        </aside>
      </div>

      {/* Mobile: Single View with Bottom Nav */}
      <div className="lg:hidden flex-1 flex flex-col h-[calc(100vh-140px)]">
        <div className="flex-1 overflow-hidden">
          {mobileView === "tasks" && (
            <TaskBoard tasksByStatus={tasksByStatus} agents={agents} />
          )}
          {mobileView === "agents" && (
            <div className="h-full overflow-y-auto p-4">
              <AgentRoster agents={agents} />
            </div>
          )}
          {mobileView === "activity" && (
            <div className="h-full overflow-y-auto p-4">
              <ActivityFeed activities={activities} agents={agents} tasks={tasks} />
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="border-t border-amber-200 bg-white">
          <div className="flex items-center justify-around">
            <button
              onClick={() => setMobileView("tasks")}
              className={`flex-1 py-3 px-4 text-center transition-colors ${
                mobileView === "tasks"
                  ? "bg-amber-100 text-amber-900 font-bold"
                  : "text-amber-600"
              }`}
            >
              <div className="text-xl mb-1">📋</div>
              <div className="text-xs uppercase tracking-wide">Tasks</div>
            </button>

            <button
              onClick={() => setMobileView("agents")}
              className={`flex-1 py-3 px-4 text-center transition-colors ${
                mobileView === "agents"
                  ? "bg-amber-100 text-amber-900 font-bold"
                  : "text-amber-600"
              }`}
            >
              <div className="text-xl mb-1">⚡</div>
              <div className="text-xs uppercase tracking-wide">
                Agents ({agents.length})
              </div>
            </button>

            <button
              onClick={() => setMobileView("activity")}
              className={`flex-1 py-3 px-4 text-center transition-colors ${
                mobileView === "activity"
                  ? "bg-amber-100 text-amber-900 font-bold"
                  : "text-amber-600"
              }`}
            >
              <div className="text-xl mb-1">📊</div>
              <div className="text-xs uppercase tracking-wide">
                Activity ({activities.length})
              </div>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
