"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Header } from "./components/Header";
import { AgentRoster } from "./components/AgentRoster";
import { TaskBoard } from "./components/TaskBoard";
import { ActivityFeed } from "./components/ActivityFeed";

export default function Home() {
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
    <div className="min-h-screen bg-amber-50">
      <Header agentsCount={agents.length} tasksInQueue={tasksInQueue} />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left: Agent Roster */}
        <aside className="hidden lg:block w-64 border-r border-amber-200 bg-white overflow-y-auto">
          <AgentRoster agents={agents} />
        </aside>

        {/* Center: Task Board */}
        <main className="flex-1 overflow-hidden">
          <TaskBoard tasksByStatus={tasksByStatus} agents={agents} />
        </main>

        {/* Right: Activity Feed */}
        <aside className="hidden xl:block w-80 border-l border-amber-200 bg-white overflow-y-auto">
          <ActivityFeed activities={activities} agents={agents} tasks={tasks} />
        </aside>
      </div>
    </div>
  );
}
