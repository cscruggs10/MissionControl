"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface Agent {
  _id: Id<"agents">;
  name: string;
  role: string;
  emoji?: string;
}

interface AddTaskModalProps {
  agents: Agent[];
  onClose: () => void;
}

export default function AddTaskModal({ agents, onClose }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<Id<"agents">[]>([]);
  
  const createTask = useMutation(api.tasks.create);
  const assign = useMutation(api.tasks.assign);

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-pink-500",
      "bg-blue-500",
      "bg-cyan-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-yellow-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const toggleAgent = (agentId: Id<"agents">) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Please fill in title and description");
      return;
    }

    try {
      const taskId = await createTask({
        title: title.trim(),
        description: description.trim(),
      });

      // If agents selected, assign them
      if (selectedAgents.length > 0) {
        await assign({
          id: taskId,
          agentIds: selectedAgents,
        });
      }

      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-800">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Add New Task</h2>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Research competitor pricing models"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task in detail..."
              rows={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Assign to Agents (Optional) */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">
              Assign to Agents (Optional)
            </h3>
            <div className="space-y-2">
              {agents.map((agent) => (
                <button
                  key={agent._id}
                  onClick={() => toggleAgent(agent._id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    selectedAgents.includes(agent._id)
                      ? "bg-gray-800 border border-blue-500"
                      : "bg-gray-850 border border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(
                      agent.name
                    )}`}
                  >
                    {agent.emoji || agent.name[0].toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-gray-400">{agent.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-6 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Create Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
