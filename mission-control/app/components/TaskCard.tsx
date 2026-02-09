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
    inbox: "bg-blue-600",
    assigned: "bg-purple-600",
    in_progress: "bg-yellow-600",
    review: "bg-orange-600",
    done: "bg-green-600",
    blocked: "bg-red-600",
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
        className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-700 cursor-pointer transition-all hover:shadow-lg"
      >
        <div className="mb-3">
          <span
            className={`text-xs px-2 py-1 rounded ${
              statusColors[task.status as keyof typeof statusColors]
            }`}
          >
            {statusLabels[task.status as keyof typeof statusLabels]}
          </span>
        </div>

        <h3 className="font-semibold mb-2 line-clamp-2">{task.title}</h3>
        <p className="text-sm text-gray-400 line-clamp-3 mb-4">
          {task.description}
        </p>

        {assignedAgents.length > 0 && (
          <div className="flex items-center gap-2">
            {assignedAgents.map((agent) => (
              <div
                key={agent._id}
                className="flex items-center gap-1 text-xs bg-gray-800 rounded-full px-2 py-1"
              >
                <span>{agent.emoji || "👤"}</span>
                <span>{agent.name}</span>
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
