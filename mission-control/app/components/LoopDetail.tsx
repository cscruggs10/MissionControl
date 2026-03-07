"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useRef } from "react";
import type { Doc } from "@/convex/_generated/dataModel";

interface LoopDetailProps {
  loopId: Id<"loops">;
  agents: Doc<"agents">[];
  onBack: () => void;
  onClose: () => void;
}

export function LoopDetail({ loopId, agents, onBack, onClose }: LoopDetailProps) {
  const loop = useQuery(api.loops.get, { id: loopId });
  const messages = useQuery(api.messages.listByLoop, { loopId });
  const createMessage = useMutation(api.messages.createInChannel);
  const closeLoop = useMutation(api.loops.close);

  const [messageText, setMessageText] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !loop) return;

    try {
      await createMessage({
        channelId: loop.channelId,
        loopId: loop._id,
        content: messageText,
        fromUser: "Corey",
      });
      setMessageText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !loop) return;

    if (!file.type.startsWith("video/") && !file.type.startsWith("image/")) {
      alert("Please select a video or image file");
      return;
    }

    setUploading(true);

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

      await createMessage({
        channelId: loop.channelId,
        loopId: loop._id,
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

  const handleCloseLoop = async () => {
    try {
      await closeLoop({
        id: loopId,
        closedBy: "Corey",
      });
      onClose();
    } catch (error) {
      console.error("Failed to close loop:", error);
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

  if (!loop) {
    return (
      <div className="flex-1 flex items-center justify-center bg-nebula-bg">
        <div className="text-nebula-text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-nebula-surface h-full">
      {/* Loop Header */}
      <div className="border-b border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          {/* Back button */}
          <button
            onClick={onBack}
            className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
            aria-label="Back to channel"
          >
            <svg className="w-6 h-6 text-nebula-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🔴</span>
              <h2 className="text-lg md:text-xl font-bold text-nebula-text">{loop.title}</h2>
            </div>
            <div className="text-xs md:text-sm text-nebula-text-muted">
              Created {formatTime(loop.createdAt)}
              {loop.assigneeIds.length > 0 && (
                <span className="ml-2">• {loop.assigneeIds.length} agent(s) assigned</span>
              )}
            </div>
          </div>

          {/* Close button */}
          {loop.status === "open" && (
            <button
              onClick={handleCloseLoop}
              className="px-4 py-2 bg-nebula-accent hover:bg-nebula-accent active:bg-nebula-accent text-white text-sm rounded-md font-medium transition-colors whitespace-nowrap"
            >
              ✓ Close Loop
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
        {!messages || messages.length === 0 ? (
          <div className="text-center text-nebula-text-light py-8">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm md:text-base">No messages yet. Start the discussion!</p>
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
      {loop.status === "open" && (
        <div className="border-t border-nebula-border p-3 md:p-4 bg-nebula-surface safe-bottom">
          <form onSubmit={handleSendMessage} className="space-y-2 md:space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Reply to this loop..."
                className="flex-1 px-4 py-3 bg-nebula-surface border border-nebula-border rounded-lg text-base text-nebula-text placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
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
                className="px-4 md:px-6 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:bg-nebula-border-light disabled:text-nebula-text-light text-white rounded-lg font-medium transition-colors"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-nebula-text-light hidden sm:block">
              💡 Discussion specific to this loop
            </p>
          </form>
        </div>
      )}

      {loop.status === "closed" && (
        <div className="border-t border-nebula-border p-4 bg-nebula-surface text-center text-nebula-text-muted">
          ✅ This loop was closed {loop.closedAt && formatTime(loop.closedAt)}
        </div>
      )}
    </div>
  );
}
