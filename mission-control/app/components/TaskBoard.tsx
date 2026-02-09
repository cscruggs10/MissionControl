"use client";

import { useState } from "react";
import type { Doc } from "../../convex/_generated/dataModel";
import TaskCard from "./TaskCard";
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
      icon: "📥",
      tasks: tasksByStatus.inbox,
      color: "bg-blue-50 border-blue-200",
      headerColor: "bg-blue-100",
    },
    {
      id: "assigned",
      title: "ASSIGNED",
      icon: "📌",
      tasks: tasksByStatus.assigned,
      color: "bg-purple-50 border-purple-200",
      headerColor: "bg-purple-100",
    },
    {
      id: "in_progress",
      title: "IN PROGRESS",
      icon: "🔄",
      tasks: tasksByStatus.in_progress,
      color: "bg-yellow-50 border-yellow-200",
      headerColor: "bg-yellow-100",
    },
    {
      id: "review",
      title: "REVIEW",
      icon: "👀",
      tasks: tasksByStatus.review,
      color: "bg-orange-50 border-orange-200",
      headerColor: "bg-orange-100",
    },
    {
      id: "done",
      title: "DONE",
      icon: "✅",
      tasks: tasksByStatus.done,
      color: "bg-green-50 border-green-200",
      headerColor: "bg-green-100",
    },
  ];

  const [activeColumnIndex, setActiveColumnIndex] = useState(0);
  const activeColumn = columns[activeColumnIndex];

  return (
    <div className="h-full flex flex-col">
      {/* Mobile: Tab Navigation */}
      <div className="md:hidden border-b border-amber-200 bg-white overflow-x-auto">
        <div className="flex min-w-max">
          {columns.map((column, index) => (
            <button
              key={column.id}
              onClick={() => setActiveColumnIndex(index)}
              className={`flex-1 min-w-[120px] px-4 py-3 text-center transition-colors border-b-2 ${
                activeColumnIndex === index
                  ? "border-amber-900 bg-amber-50"
                  : "border-transparent"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">{column.icon}</span>
                <div className="text-left">
                  <div className={`text-xs font-bold uppercase tracking-wide ${
                    activeColumnIndex === index ? "text-amber-900" : "text-amber-600"
                  }`}>
                    {column.title}
                  </div>
                  <div className="text-xs text-amber-500">
                    {column.tasks.length}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: Single Column View */}
      <div className="md:hidden flex-1 overflow-y-auto bg-amber-50 p-3">
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
            <div className="text-center text-amber-400 py-12">
              <div className="text-4xl mb-2">{activeColumn.icon}</div>
              <div className="text-sm font-medium">No tasks in {activeColumn.title}</div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop: Kanban Board */}
      <div className="hidden md:flex flex-1 overflow-x-auto overflow-y-hidden bg-amber-50 p-4">
        <div className="flex gap-3 h-full min-w-max">
          {columns.map((column) => (
            <div
              key={column.id}
              className="w-72 lg:w-80 flex-shrink-0 flex flex-col"
            >
              <div
                className={`${column.headerColor} rounded-t-lg px-3 py-2.5 border border-b-2 ${column.color.split(' ')[1]}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{column.icon}</span>
                    <span className="font-bold text-amber-900 text-xs uppercase tracking-wider">
                      {column.title}
                    </span>
                  </div>
                  <span className="bg-white text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                    {column.tasks.length}
                  </span>
                </div>
              </div>

              <div className={`flex-1 overflow-y-auto ${column.color} rounded-b-lg border-x border-b p-3 space-y-2.5`}>
                {column.tasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    agents={agents}
                    onClick={() => setSelectedTask(task)}
                  />
                ))}

                {column.tasks.length === 0 && (
                  <div className="text-center text-amber-400 py-12">
                    <div className="text-3xl mb-2">{column.icon}</div>
                    <div className="text-xs font-medium">Empty</div>
                  </div>
                )}
              </div>
            </div>
          ))}
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
