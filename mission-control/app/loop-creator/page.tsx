"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  options?: string[];
}

interface UploadedFile {
  filename: string;
  url: string;
  size: number;
  type: string;
}

export default function LoopCreatorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hey! I'm here to help you create loops. Want to create one now?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/loop-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message: input,
          files: uploadedFiles,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(data.timestamp),
        options: data.options,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // If loop was created, celebrate!
      if (data.loopCreated) {
        // Clear uploaded files
        setUploadedFiles([]);
        
        setTimeout(() => {
          const celebrationMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: "assistant",
            content: "🎉 Want to create another loop?",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, celebrationMessage]);
        }, 1000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = async (option: string) => {
    if (isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: option,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/loop-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message: option,
          files: uploadedFiles,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(data.timestamp),
        options: data.options,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.loopCreated) {
        // Clear uploaded files
        setUploadedFiles([]);
        
        setTimeout(() => {
          const celebrationMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: "assistant",
            content: "🎉 Want to create another loop?",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, celebrationMessage]);
        }, 1000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload-file", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        return await response.json();
      });

      const results = await Promise.all(uploadPromises);
      setUploadedFiles((prev) => [...prev, ...results]);

      // Notify user
      const fileNames = results.map((f) => f.filename).join(", ");
      const confirmMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `✅ Uploaded: ${fileNames}\n\nFiles will be attached to the loop when created.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, confirmMessage]);
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, failed to upload files. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="min-h-screen bg-nebula-bg dark:bg-nebula-dark-bg flex flex-col">
      {/* Header */}
      <div className="bg-nebula-surface dark:bg-nebula-dark-surface border-b border-nebula-border dark:border-nebula-dark-border p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold text-nebula-text dark:text-nebula-dark-text flex items-center gap-2">
            <span>🔧</span>
            <span>Loop Creator</span>
          </h1>
          <p className="text-sm text-nebula-text-muted dark:text-nebula-dark-text-muted mt-1">
            Create loops in Mission Control through simple conversation
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <div key={msg.id}>
              <div
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-nebula-blue text-white"
                      : "bg-nebula-surface dark:bg-nebula-dark-surface text-nebula-text dark:text-nebula-dark-text border border-nebula-border dark:border-nebula-dark-border"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.role === "user"
                        ? "text-white/70"
                        : "text-nebula-text-light dark:text-nebula-dark-text-light"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Quick Reply Options */}
              {msg.role === "assistant" &&
                msg.options &&
                msg.options.length > 0 &&
                idx === messages.length - 1 && (
                  <div className="flex flex-wrap gap-2 mt-2 justify-start">
                    {msg.options.slice(0, 6).map((option) => (
                      <button
                        key={option}
                        onClick={() => handleQuickReply(option)}
                        disabled={isLoading}
                        className="px-3 py-2 rounded-lg bg-nebula-bg dark:bg-nebula-dark-bg border border-nebula-border dark:border-nebula-dark-border text-nebula-text dark:text-nebula-dark-text text-sm hover:bg-nebula-border dark:hover:bg-nebula-dark-border transition-colors disabled:opacity-50"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-nebula-surface dark:bg-nebula-dark-surface text-nebula-text dark:text-nebula-dark-text border border-nebula-border dark:border-nebula-dark-border rounded-lg px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-nebula-text-light dark:bg-nebula-dark-text-light rounded-full animate-bounce"></span>
                  <span
                    className="w-2 h-2 bg-nebula-text-light dark:bg-nebula-dark-text-light rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-nebula-text-light dark:bg-nebula-dark-text-light rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-nebula-border dark:border-nebula-dark-border bg-nebula-surface dark:bg-nebula-dark-surface p-4">
        <div className="max-w-2xl mx-auto">
          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {uploadedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-nebula-bg dark:bg-nebula-dark-bg border border-nebula-border dark:border-nebula-dark-border text-sm"
                >
                  <span className="text-nebula-text dark:text-nebula-dark-text">
                    {file.type.startsWith("image/") ? "🖼️" : 
                     file.type.startsWith("video/") ? "🎥" : "📄"}
                  </span>
                  <span className="text-nebula-text-muted dark:text-nebula-dark-text-muted truncate max-w-[150px]">
                    {file.filename}
                  </span>
                  <button
                    onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-nebula-text-light hover:text-nebula-text-muted"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={handleFileUpload}
              disabled={isUploading}
              className="p-3 rounded-lg bg-nebula-bg dark:bg-nebula-dark-bg hover:bg-nebula-border dark:hover:bg-nebula-dark-border transition-colors disabled:opacity-50"
              title="Attach files"
            >
              {isUploading ? (
                <svg
                  className="w-5 h-5 text-nebula-text-muted dark:text-nebula-dark-text-muted animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-nebula-text-muted dark:text-nebula-dark-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              )}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 rounded-lg bg-nebula-bg dark:bg-nebula-dark-bg border border-nebula-border dark:border-nebula-dark-border text-nebula-text dark:text-nebula-dark-text placeholder-nebula-text-light dark:placeholder-nebula-dark-text-light focus:outline-none focus:ring-2 focus:ring-nebula-blue"
              disabled={isLoading}
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 rounded-lg bg-nebula-blue hover:opacity-90 text-white font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
