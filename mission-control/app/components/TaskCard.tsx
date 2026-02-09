"use client";

import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import TaskModal from "./TaskModal";

interface Task {
  _id: Id<"tasks">;
  title: string;
  description: string;
  status: string;
  assigneeIds: Id<"agents">[];
  createdAt: number;
  updatedAt: number;
}

interface Agent {
  _id: Id<"agents">;
  name: string;
  role: string;
  emoji?: string;
}

interface TaskCardProps {
  task: Task;
  agents: Agent[];
  onClick?: () => void;
}

export default function TaskCard({ task, agents, onClick }: TaskCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const assignedAgents = agents.filter((a) => task.assigneeIds.includes(a._id));

  const statusColors = {
    inbox: "bg-blue-100 text-blue-800 border-blue-200",
    assigned: "bg-purple-100 text-purple-800 border-purple-200",
    in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
    review: "bg-orange-100 text-orange-800 border-orange-200",
    done: "bg-green-100 text-green-800 border-green-200",
    blocked: "bg-red-100 text-red-800 border-red-200",
  };

  const statusLabels = {
    inbox: "Inbox",
    assigned: "Assigned",
    in_progress: "In Progress",
    review: "Review",
    done: "Done",
    blocked: "Blocked",
  };

  return (
    <>
      <div
        onClick={onClick || (() => setIsOpen(true))}
        className="bg-white rounded-lg p-3 md:p-4 border border-amber-200 hover:border-amber-400 cursor-pointer transition-all hover:shadow-md"
      >
        <div className="mb-2">
          <span
            className={`text-xs px-2 py-1 rounded border font-medium uppercase tracking-wide ${
              statusColors[task.status as keyof typeof statusColors]
            }`}
          >
            {statusLabels[task.status as keyof typeof statusLabels]}
          </span>
        </div>

        <h3 className="font-bold text-amber-900 mb-2 line-clamp-2 text-sm md:text-base">
          {task.title}
        </h3>
        
        <p className="text-xs md:text-sm text-amber-700 line-clamp-2 md:line-clamp-3 mb-3">
          {task.description}
        </p>

        {assignedAgents.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {assignedAgents.map((agent) => (
              <div
                key={agent._id}
                className="flex items-center gap-1 text-xs bg-amber-100 text-amber-900 rounded-full px-2 py-1 border border-amber-200"
              >
                <span className="text-sm">{agent.emoji || "👤"}</span>
                <span className="font-medium">{agent.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {isOpen && (
        <TaskModal
          task={task}
          agents={agents}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
