"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";

export function TaskDetail({
  task,
  agents,
  onClose,
}: {
  task: Doc<"tasks">;
  agents: Doc<"agents">[];
  onClose: () => void;
}) {
  const messages = useQuery(api.messages.listByTask, { taskId: task._id });
  const createMessage = useMutation(api.messages.create);
  const updateStatus = useMutation(api.tasks.updateStatus);
  const [comment, setComment] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionPosition, setMentionPosition] = useState(0);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const assignedAgents = agents.filter((a) =>
    task.assigneeIds.includes(a._id as Id<"agents">)
  );

  const getAgentById = (id?: Id<"agents">) => {
    return agents.find((a) => a._id === id);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusColors: Record<string, string> = {
    inbox: "bg-amber-100 text-amber-800",
    assigned: "bg-blue-100 text-blue-800",
    in_progress: "bg-purple-100 text-purple-800",
    review: "bg-orange-100 text-orange-800",
    done: "bg-green-100 text-green-800",
    blocked: "bg-red-100 text-red-800",
  };

  // Filter agents based on mention search
  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setComment(value);

    // Check if we're typing an @ mention
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Only show mentions if @ is at start or after whitespace, and no space after @
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : " ";
      if ((charBeforeAt === " " || charBeforeAt === "\n" || lastAtIndex === 0) && !textAfterAt.includes(" ")) {
        setShowMentions(true);
        setMentionSearch(textAfterAt);
        setMentionPosition(lastAtIndex);
        setSelectedMentionIndex(0);
        return;
      }
    }

    setShowMentions(false);
  };

  const insertMention = (agentName: string) => {
    const beforeMention = comment.slice(0, mentionPosition);
    const afterMention = comment.slice(textareaRef.current?.selectionStart || comment.length);
    const newComment = beforeMention + "@" + agentName.toLowerCase() + " " + afterMention;
    setComment(newComment);
    setShowMentions(false);
    setMentionSearch("");
    
    // Focus textarea and move cursor after the mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionPosition + agentName.length + 2; // +2 for @ and space
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedMentionIndex((prev) => 
        prev < filteredAgents.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedMentionIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && filteredAgents.length > 0) {
      e.preventDefault();
      insertMention(filteredAgents[selectedMentionIndex].name);
    } else if (e.key === "Escape") {
      setShowMentions(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's a video
    if (!file.type.startsWith("video/")) {
      alert("Please select a video file");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();

      // Create message with video
      await createMessage({
        taskId: task._id,
        content: comment.trim() || "Uploaded a video",
        fromUser: "Corey",
        mediaUrl: result.url,
        mediaType: "video",
      });

      setComment("");
      setShowMentions(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to upload video:", error);
      alert("Failed to upload video. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await createMessage({
        taskId: task._id,
        content: comment,
        fromUser: "Corey", // TODO: Get from auth context
      });
      setComment("");
      setShowMentions(false);
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-nebula-surface rounded-lg shadow-2xl max-w-3xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-amber-200 p-4 md:p-6">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <h2 className="text-lg md:text-2xl font-bold text-amber-900 flex-1 pr-4">
              {task.title}
            </h2>
            <button
              onClick={onClose}
              className="text-amber-600 hover:text-amber-900 text-3xl font-bold leading-none"
            >
              ×
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={task.status}
              onChange={(e) => {
                updateStatus({
                  id: task._id,
                  status: e.target.value as "inbox" | "assigned" | "in_progress" | "blocked" | "done",
                });
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border-2 cursor-pointer transition-colors ${
                statusColors[task.status]
              } hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-amber-500`}
            >
              <option value="inbox">Inbox</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="blocked">Blocked</option>
              <option value="done">Done</option>
            </select>

            {assignedAgents.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-amber-600">Assigned to:</span>
                {assignedAgents.map((agent) => (
                  <div
                    key={agent._id}
                    className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full"
                  >
                    <span className="text-sm">{agent.emoji || "🤖"}</span>
                    <span className="text-xs font-medium text-amber-900">
                      {agent.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide mb-2">
              Description
            </h3>
            <p className="text-amber-800 whitespace-pre-wrap">
              {task.description}
            </p>
          </div>

          {/* Comments Thread */}
          <div>
            <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide mb-4">
              Activity ({messages?.length || 0})
            </h3>

            {messages && messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const author = msg.fromAgentId
                    ? getAgentById(msg.fromAgentId as Id<"agents">)
                    : null;
                  const displayName = author?.name || msg.fromUser || "System";
                  const emoji = author?.emoji || "👤";

                  return (
                    <div
                      key={msg._id}
                      className="bg-amber-50 rounded-lg p-4 border border-amber-100"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-lg flex-shrink-0">
                          {emoji}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="font-bold text-amber-900">
                              {displayName}
                            </span>
                            <span className="text-xs text-amber-500">
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>

                          <p className="text-amber-800 whitespace-pre-wrap">
                            {msg.content}
                          </p>

                          {/* Video Display */}
                          {msg.mediaType === "video" && msg.mediaUrl && (
                            <div className="mt-3">
                              <video
                                controls
                                className="w-full max-w-2xl rounded-lg border border-amber-200"
                                preload="metadata"
                              >
                                <source src={msg.mediaUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          )}

                          {/* Image Display */}
                          {msg.mediaType === "image" && msg.mediaUrl && (
                            <div className="mt-3">
                              <img
                                src={msg.mediaUrl}
                                alt="Uploaded image"
                                className="w-full max-w-2xl rounded-lg border border-amber-200"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-amber-500 text-center py-8">
                No comments yet
              </p>
            )}
          </div>
        </div>

        {/* Comment Form */}
        <div className="border-t border-amber-200 p-4">
          <form onSubmit={handleCommentSubmit} className="space-y-2">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={comment}
                onChange={handleCommentChange}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment... (type @ to mention agents)"
                className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900 placeholder-amber-400"
                rows={3}
              />
              
              {/* Mention Autocomplete Dropdown */}
              {showMentions && filteredAgents.length > 0 && (
                <div className="absolute bottom-full left-0 mb-1 w-full md:w-64 bg-nebula-surface border border-amber-200 rounded-lg shadow-lg overflow-hidden z-10 max-h-60 overflow-y-auto">
                  {filteredAgents.map((agent, index) => (
                    <button
                      key={agent._id}
                      type="button"
                      onClick={() => insertMention(agent.name)}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        insertMention(agent.name);
                      }}
                      className={`w-full px-3 py-3 text-left flex items-center gap-2 hover:bg-amber-50 active:bg-amber-100 transition-colors touch-manipulation ${
                        index === selectedMentionIndex ? "bg-amber-100" : ""
                      }`}
                    >
                      <span className="text-lg flex-shrink-0">{agent.emoji || "🤖"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-amber-900">{agent.name}</div>
                        <div className="text-xs text-amber-600 truncate">{agent.role}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-200 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  title="Upload Video"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {uploading ? "Uploading..." : "Video"}
                </button>
                <p className="text-xs text-amber-600 hidden md:block">
                  💡 Tip: Type <strong>@</strong> to mention agents (instant wake)
                </p>
              </div>
              <button
                type="submit"
                disabled={!comment.trim() || uploading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-white rounded-lg font-medium transition-colors"
              >
                Post Comment
              </button>
            </div>
            
            {uploading && (
              <div className="mt-2">
                <div className="w-full bg-amber-100 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-amber-600 mt-1">Uploading video...</p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-amber-200 p-4 bg-amber-50">
          <div className="flex items-center justify-between text-xs text-amber-600">
            <span>Created {formatTime(task.createdAt)}</span>
            <span>Updated {formatTime(task.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
