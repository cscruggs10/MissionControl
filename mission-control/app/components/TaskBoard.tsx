"use client";

import { useState } from "react";
import type { Doc } from "../../convex/_generated/dataModel";
import { TaskCard } from "./TaskCard";
import { TaskDetail } from "./TaskDetail";

type TasksByStatus = {
  inbox: Doc<"tasks">[];
  assigned: Doc<"tasks">[];
  in_progress: Doc<"tasks">[];
  review: Doc<"tasks">[];
  done: Doc<"tasks">[];
};

export function TaskBoard({
  tasksByStatus,
  agents,
}: {
  tasksByStatus: TasksByStatus;
  agents: Doc<"agents">[];
}) {
  const [selectedTask, setSelectedTask] = useState<Doc<"tasks"> | null>(null);
  const columns = [
    {
      id: "inbox",
      title: "INBOX",
      tasks: tasksByStatus.inbox,
      color: "amber-100",
    },
    {
      id: "assigned",
      title: "ASSIGNED",
      tasks: tasksByStatus.assigned,
      color: "blue-100",
    },
    {
      id: "in_progress",
      title: "IN PROGRESS",
      tasks: tasksByStatus.in_progress,
      color: "purple-100",
    },
    {
      id: "review",
      title: "REVIEW",
      tasks: tasksByStatus.review,
      color: "orange-100",
    },
    {
      id: "done",
      title: "DONE",
      tasks: tasksByStatus.done,
      color: "green-100",
    },
  ];

  const [activeColumnIndex, setActiveColumnIndex] = useState(0);
  const activeColumn = columns[activeColumnIndex];

  return (
    <div className="h-full">
      <div className="bg-white rounded-lg border border-amber-200 h-full flex flex-col">
        <div className="border-b border-amber-200 px-4 py-3">
          <h2 className="text-lg font-bold text-amber-900 uppercase tracking-wide">
            📋 MISSION QUEUE
          </h2>
        </div>

        {/* Mobile: Tab Navigation */}
        <div className="md:hidden border-b border-amber-200 px-2 py-2 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {columns.map((column, index) => (
              <button
                key={column.id}
                onClick={() => setActiveColumnIndex(index)}
                className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors whitespace-nowrap ${
                  activeColumnIndex === index
                    ? "bg-amber-900 text-white"
                    : "bg-amber-100 text-amber-900"
                }`}
              >
                {column.title} ({column.tasks.length})
              </button>
            ))}
          </div>
        </div>

        {/* Mobile: Single Column View */}
        <div className="md:hidden flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {activeColumn.tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                agents={agents}
                onClick={() => setSelectedTask(task)}
              />
            ))}

            {activeColumn.tasks.length === 0 && (
              <div className="text-center text-amber-400 py-8 text-sm">
                No tasks in {activeColumn.title}
              </div>
            )}
          </div>
        </div>

        {/* Desktop: Kanban Board */}
        <div className="hidden md:flex flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 p-4 h-full min-w-max">
            {columns.map((column) => (
              <div
                key={column.id}
                className="w-72 flex-shrink-0 flex flex-col"
              >
                <div
                  className={`bg-${column.color} rounded-t-lg px-4 py-2 border-b-2 border-amber-300`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 text-sm uppercase tracking-wide">
                      {column.title}
                    </span>
                    <span className="bg-white text-amber-900 text-xs font-bold px-2 py-1 rounded-full">
                      {column.tasks.length}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-amber-50 rounded-b-lg p-3 space-y-3">
                  {column.tasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      agents={agents}
                      onClick={() => setSelectedTask(task)}
                    />
                  ))}

                  {column.tasks.length === 0 && (
                    <div className="text-center text-amber-400 py-8 text-sm">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          agents={agents}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
