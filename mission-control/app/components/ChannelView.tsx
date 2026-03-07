"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useRef } from "react";
import type { Doc } from "@/convex/_generated/dataModel";
import { LoopDetail } from "./LoopDetail";

interface ChannelViewProps {
  channelId?: Id<"channels">;
  agents: Doc<"agents">[];
  onBack?: () => void;
}

export function ChannelView({ channelId, agents, onBack }: ChannelViewProps) {
  const channel = useQuery(
    api.channels.get,
    channelId ? { id: channelId } : "skip"
  );
  const messages = useQuery(
    api.messages.listByChannel,
    channelId ? { channelId } : "skip"
  );
  const openLoops = useQuery(
    api.loops.listByChannel,
    channelId ? { channelId, status: "open" } : "skip"
  );
  const closedLoops = useQuery(
    api.loops.listByChannel,
    channelId ? { channelId, status: "closed" } : "skip"
  );
  const createMessage = useMutation(api.messages.createInChannel);
  const updateMessageLoopId = useMutation(api.messages.updateLoopId);
  const createLoop = useMutation(api.loops.create);
  const closeLoop = useMutation(api.loops.close);

  const [messageText, setMessageText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isCreatingLoop, setIsCreatingLoop] = useState(false);
  const [loopTitle, setLoopTitle] = useState("");
  const [showClosedLoops, setShowClosedLoops] = useState(false);
  const [selectedLoopId, setSelectedLoopId] = useState<Id<"loops"> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !channelId) return;

    try {
      // If creating a loop, create the loop first, then add message to it
      if (isCreatingLoop && loopTitle.trim()) {
        // Get agents assigned to this channel
        const channelAgentIds = channel?.agentIds || [];
        
        // Create the message first (it will be the first message in the loop)
        const messageId = await createMessage({
          channelId,
          content: messageText,
          fromUser: "Corey",
        });
        
        // Create the loop and link it to the message
        const loopId = await createLoop({
          channelId,
          messageId: messageId,
          title: loopTitle,
          assigneeIds: channelAgentIds,
          createdBy: "Corey",
        });
        
        // Update the message to belong to this loop (moves it from channel to loop)
        await updateMessageLoopId({
          messageId: messageId,
          loopId: loopId,
        });
        
        setLoopTitle("");
        setIsCreatingLoop(false);
      } else {
        // Normal message to channel (not in a loop)
        await createMessage({
          channelId,
          content: messageText,
          fromUser: "Corey",
        });
      }

      setMessageText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleCloseLoop = async (loopId: Id<"loops">) => {
    try {
      await closeLoop({
        id: loopId,
        closedBy: "Corey",
      });
    } catch (error) {
      console.error("Failed to close loop:", error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !channelId) return;

    if (!file.type.startsWith("video/") && !file.type.startsWith("image/")) {
      alert("Please select a video or image file");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const endpoint = file.type.startsWith("video/")
        ? "/api/upload-video"
        : "/api/upload-video"; // Will handle images too

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();

      await createMessage({
        channelId,
        content: messageText.trim() || `Uploaded ${file.type.startsWith("video/") ? "video" : "image"}`,
        fromUser: "Corey",
        mediaUrl: result.url,
        mediaType: file.type.startsWith("video/") ? "video" : "image",
      });

      setMessageText("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to upload:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAgentById = (id?: Id<"agents">) => {
    return agents.find((a) => a._id === id);
  };

  // Show loop detail if a loop is selected
  if (selectedLoopId) {
    return (
      <LoopDetail
        loopId={selectedLoopId}
        agents={agents}
        onBack={() => setSelectedLoopId(null)}
        onClose={() => setSelectedLoopId(null)}
      />
    );
  }

  if (!channelId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-nebula-bg text-nebula-text-muted">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold mb-2 text-nebula-text">Welcome to Mission Control</h2>
          <p className="text-nebula-text-light">Select a channel to start messaging</p>
        </div>
      </div>
    );
  }

  if (!channel || !messages) {
    return (
      <div className="flex-1 flex items-center justify-center bg-nebula-bg text-nebula-text-muted">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-nebula-surface h-full">
      {/* Channel Header */}
      <div className="border-b border-nebula-border p-4 bg-nebula-surface">
        <div className="flex items-center gap-3">
          {/* Back button for mobile */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 hover:bg-nebula-border-light rounded-lg transition-colors"
              aria-label="Back to channels"
            >
              <svg className="w-6 h-6 text-nebula-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <span className="text-2xl">{channel.emoji || "#"}</span>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-nebula-text truncate">{channel.name}</h2>
            {channel.description && (
              <p className="text-sm text-nebula-text-muted truncate hidden sm:block">{channel.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Open Loops */}
      {openLoops && openLoops.length > 0 && (
        <div className="border-b border-amber-200 bg-amber-50 p-3 md:p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-amber-900 flex items-center gap-2 text-sm md:text-base">
              <span className="text-base md:text-lg">🔴</span>
              Open Loops ({openLoops.length})
            </h3>
          </div>
          <div className="space-y-2">
            {openLoops.map((loop) => (
              <div
                key={loop._id}
                className="bg-nebula-surface border-l-4 border-amber-500 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-3 hover:shadow-sm transition-shadow"
              >
                <button
                  onClick={() => setSelectedLoopId(loop._id)}
                  className="flex-1 min-w-0 text-left hover:bg-nebula-surface -m-3 p-3 rounded-lg transition-colors"
                >
                  <div className="font-medium text-nebula-text text-sm md:text-base">{loop.title}</div>
                  <div className="text-xs text-nebula-text-muted mt-1">
                    Created {formatTime(loop.createdAt)}
                    {loop.assigneeIds.length > 0 && (
                      <span className="hidden sm:inline ml-2">
                        • {loop.assigneeIds.length} agent(s)
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseLoop(loop._id);
                  }}
                  className="px-4 py-2 bg-nebula-accent hover:bg-nebula-accent active:bg-nebula-accent text-white text-sm rounded-md font-medium transition-colors whitespace-nowrap"
                >
                  ✓ Close
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Closed Loops Toggle */}
      {closedLoops && closedLoops.length > 0 && (
        <div className="border-b border-nebula-border bg-nebula-surface px-4 py-2">
          <button
            onClick={() => setShowClosedLoops(!showClosedLoops)}
            className="text-sm text-nebula-text-muted hover:text-nebula-text flex items-center gap-2"
          >
            <span>{showClosedLoops ? "▼" : "▶"}</span>
            <span>✅ {closedLoops.length} Closed Loop(s)</span>
          </button>
          {showClosedLoops && (
            <div className="mt-3 space-y-2">
              {closedLoops.map((loop) => (
                <div
                  key={loop._id}
                  className="bg-nebula-surface border-l-4 border-emerald-500 rounded-lg p-3 opacity-60"
                >
                  <div className="font-medium text-nebula-text">{loop.title}</div>
                  <div className="text-xs text-nebula-text-muted mt-1">
                    Closed {loop.closedAt ? formatTime(loop.closedAt) : ""}
                    {loop.closedBy && ` by ${loop.closedBy}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-nebula-text-light py-8">
            <div className="text-4xl mb-2">👋</div>
            <p className="text-sm md:text-base">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const author = msg.fromAgentId
              ? getAgentById(msg.fromAgentId as Id<"agents">)
              : null;
            const displayName = author?.name || msg.fromUser || "System";
            const emoji = author?.emoji || "👤";

            return (
              <div key={msg._id} className="flex gap-2 md:gap-3 hover:bg-nebula-surface -mx-2 px-2 py-2 rounded-lg transition-colors">
                {/* Avatar */}
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-nebula-border-light flex items-center justify-center text-lg md:text-xl flex-shrink-0">
                  {emoji}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-nebula-text text-sm md:text-base">{displayName}</span>
                    <span className="text-xs text-nebula-text-light">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>

                  <p className="text-nebula-text text-sm md:text-base whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>

                  {/* Media */}
                  {msg.mediaType === "video" && msg.mediaUrl && (
                    <div className="mt-2 md:mt-3 max-w-full md:max-w-2xl">
                      <video
                        controls
                        className="w-full rounded-lg border border-nebula-border shadow-sm"
                        preload="metadata"
                        playsInline
                      >
                        <source src={msg.mediaUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}

                  {msg.mediaType === "image" && msg.mediaUrl && (
                    <div className="mt-2 md:mt-3 max-w-full md:max-w-2xl">
                      <img
                        src={msg.mediaUrl}
                        alt="Uploaded image"
                        className="w-full rounded-lg border border-nebula-border shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-nebula-border p-3 md:p-4 bg-nebula-surface safe-bottom">
        <form onSubmit={handleSendMessage} className="space-y-2 md:space-y-3">
          {/* Loop Creation Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingLoop(!isCreatingLoop)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isCreatingLoop
                  ? "bg-amber-500 text-white"
                  : "bg-nebula-border-light text-nebula-text hover:bg-nebula-border active:bg-nebula-border"
              }`}
            >
              <span>🔴</span>
              {isCreatingLoop ? "Creating Loop" : "Create Loop"}
            </button>
            {isCreatingLoop && (
              <input
                type="text"
                value={loopTitle}
                onChange={(e) => setLoopTitle(e.target.value)}
                placeholder="Loop title..."
                className="flex-1 px-3 py-2 bg-nebula-surface border border-amber-300 rounded-md text-sm text-nebula-text placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Message #${channel.name}`}
              className="flex-1 px-4 py-3 bg-nebula-surface border border-nebula-border rounded-lg text-base text-nebula-text placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              disabled={uploading}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-3 md:px-4 py-3 bg-nebula-border-light hover:bg-nebula-border active:bg-nebula-border disabled:bg-nebula-bg text-nebula-text rounded-lg font-medium transition-colors flex items-center gap-2"
              title="Upload Media"
            >
              {uploading ? (
                <span className="text-sm">...</span>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">Media</span>
                </>
              )}
            </button>
            <button
              type="submit"
              disabled={!messageText.trim() || uploading}
              className="px-4 md:px-6 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-nebula-border-light disabled:text-nebula-text-light text-white rounded-lg font-medium transition-colors"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-nebula-text-light hidden sm:block">
            💡 Agents in this channel will see your messages and respond
          </p>
        </form>
      </div>
    </div>
  );
}
