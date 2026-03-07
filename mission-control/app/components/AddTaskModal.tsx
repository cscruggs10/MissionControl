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
  channelId?: Id<"channels">;
  onClose: () => void;
}

interface Step {
  title: string;
  description: string;
  assigneeId: Id<"agents"> | null;
}

export default function AddTaskModal({ agents, channelId, onClose }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<Id<"agents">[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [showSteps, setShowSteps] = useState(false);
  
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

  const addStep = () => {
    setSteps([...steps, { title: "", description: "", assigneeId: null }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: keyof Step, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Please fill in title and description");
      return;
    }

    // Validate steps if they exist
    if (steps.length > 0) {
      const invalidStep = steps.find((step) => !step.title.trim());
      if (invalidStep) {
        alert("All steps must have a title");
        return;
      }
    }

    try {
      // Convert dueDate to timestamp if provided
      let dueDateTimestamp: number | undefined;
      if (dueDate) {
        dueDateTimestamp = new Date(dueDate).getTime();
      }

      // Prepare steps data
      const stepsData = steps.map((step) => ({
        title: step.title.trim(),
        description: step.description?.trim() || undefined,
        assigneeId: step.assigneeId || undefined,
      }));

      const taskId = await createTask({
        title: title.trim(),
        description: description.trim(),
        channelId: channelId,
        dueDate: dueDateTimestamp,
        steps: stepsData.length > 0 ? stepsData : undefined,
      });

      // If agents selected (for overall task), assign them
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
      <div className="bg-gray-900 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-800">
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
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task in detail..."
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Due Date (Optional) */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Due Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-300 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Multi-Step Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              <span>{showSteps ? "−" : "+"}</span>
              {showSteps ? "Hide Steps" : "Add Steps (Multi-Step Task)"}
            </button>
          </div>

          {/* Steps Section */}
          {showSteps && (
            <div className="mb-6 p-4 bg-gray-850 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-400">
                  Task Steps
                </h3>
                <button
                  onClick={addStep}
                  className="px-3 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  + Add Step
                </button>
              </div>

              {steps.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No steps added yet. Click "Add Step" to create a multi-step task.
                </p>
              )}

              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500">
                        Step {index + 1}
                      </span>
                      <button
                        onClick={() => removeStep(index)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>

                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) =>
                        updateStep(index, "title", e.target.value)
                      }
                      placeholder="Step title"
                      className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-2"
                    />

                    <textarea
                      value={step.description}
                      onChange={(e) =>
                        updateStep(index, "description", e.target.value)
                      }
                      placeholder="Description (optional)"
                      rows={2}
                      className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none mb-2"
                    />

                    <select
                      value={step.assigneeId || ""}
                      onChange={(e) =>
                        updateStep(
                          index,
                          "assigneeId",
                          e.target.value || null
                        )
                      }
                      className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Assign to agent (optional)</option>
                      {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.emoji} {agent.name} - {agent.role}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assign to Agents (Optional - for overall task oversight) */}
          {!showSteps && (
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
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
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
