"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import TaskCard from "./components/TaskCard";
import AddTaskModal from "./components/AddTaskModal";

export default function Home() {
  const [showAddTask, setShowAddTask] = useState(false);
  const tasks = useQuery(api.tasks.list);
  const agents = useQuery(api.agents.list);

  if (!tasks || !agents) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading Mission Control...</div>
      </div>
    );
  }

  const inboxTasks = tasks.filter((t) => t.status === "inbox");
  const activeTasks = tasks.filter((t) =>
    ["assigned", "in_progress", "review"].includes(t.status)
  );
  const blockedTasks = tasks.filter((t) => t.status === "blocked");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Mission Control</h1>
            <p className="text-gray-400">Agent task coordination</p>
          </div>
          <button
            onClick={() => setShowAddTask(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Add Task
          </button>
        </header>

        <div className="grid gap-8">
          {/* Inbox */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <span>📥</span> Inbox
              <span className="text-sm text-gray-400">({inboxTasks.length})</span>
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inboxTasks.map((task) => (
                <TaskCard key={task._id} task={task} agents={agents} />
              ))}
            </div>
          </section>

          {/* Active */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <span>🔄</span> Active
              <span className="text-sm text-gray-400">({activeTasks.length})</span>
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeTasks.map((task) => (
                <TaskCard key={task._id} task={task} agents={agents} />
              ))}
            </div>
          </section>

          {/* Blocked */}
          {blockedTasks.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span>🚫</span> Blocked
                <span className="text-sm text-gray-400">({blockedTasks.length})</span>
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {blockedTasks.map((task) => (
                  <TaskCard key={task._id} task={task} agents={agents} />
                ))}
              </div>
            </section>
          )}

          {/* Done */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <span>✅</span> Done
              <span className="text-sm text-gray-400">({doneTasks.length})</span>
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {doneTasks.slice(0, 6).map((task) => (
                <TaskCard key={task._id} task={task} agents={agents} />
              ))}
            </div>
          </section>
        </div>
      </div>

      {showAddTask && (
        <AddTaskModal agents={agents} onClose={() => setShowAddTask(false)} />
      )}
    </div>
  );
}
