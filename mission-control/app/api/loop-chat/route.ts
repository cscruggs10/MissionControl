import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  LoopCreatorAgent,
  type LoopCreatorSession,
} from "@/lib/loopCreator";

interface UploadedFile {
  filename: string;
  size: number;
  url?: string;
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// In-memory session storage (TODO: move to Redis/DB for production)
const sessions = new Map<string, LoopCreatorSession>();

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId = "default", files = [] } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Fetch channels and agents
    const [channels, agents] = await Promise.all([
      convex.query(api.channels.list, {}),
      convex.query(api.agents.list, {}),
    ]);

    // Get or create session
    const existingSession = sessions.get(sessionId);
    const agent = new LoopCreatorAgent(existingSession, channels, agents);

    // Process message
    const response = await agent.processMessage(message);

    // Merge files into session (deduplicate by filename)
    if (files.length > 0) {
      const existingFiles = response.session.files || [];
      const existingFilenames = new Set(existingFiles.map((f: UploadedFile) => f.filename));
      const newFiles = (files as UploadedFile[]).filter((f: UploadedFile) => !existingFilenames.has(f.filename));
      
      response.session.files = [
        ...existingFiles,
        ...newFiles,
      ];
    }

    // Save session
    sessions.set(sessionId, response.session);

    // Check if we need to create the loop
    if (response.message === "CREATE_LOOP") {
      const loopId = await createLoop(response.session);

      // Clear session
      sessions.delete(sessionId);

      const fileCount = response.session.files?.length || 0;
      
      return NextResponse.json({
        message: `✅ Loop created!\n\n📋 ${response.session.title}\n📂 Channel: ${response.session.channelName}\n${response.session.assigneeNames && response.session.assigneeNames.length > 0 ? `👥 Assigned: ${response.session.assigneeNames.join(", ")}\n` : ""}${fileCount > 0 ? `📎 ${fileCount} file${fileCount > 1 ? "s" : ""} attached\n` : ""}View at: ${process.env.NEXT_PUBLIC_BASE_URL || "http://134.199.192.218:3000"}`,
        timestamp: new Date().toISOString(),
        sessionId,
        loopCreated: true,
        loopId,
        loopTitle: response.session.title,
        channelName: response.session.channelName,
      });
    }

    return NextResponse.json({
      message: response.message,
      timestamp: new Date().toISOString(),
      sessionId,
      state: response.state,
      options: response.options,
    });
  } catch (error) {
    console.error("Loop chat error:", error);
    return NextResponse.json(
      {
        error: "Failed to process message",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function createLoop(session: LoopCreatorSession): Promise<string> {
  if (!session.channelId || !session.title) {
    throw new Error("Missing required fields");
  }

  try {
    // Step 1: Create initial message in channel
    let messageContent = session.description || `Loop created: ${session.title}`;
    
    // Add file references to message
    if (session.files && session.files.length > 0) {
      messageContent += "\n\n📎 Attached files:\n";
      session.files.forEach((file: UploadedFile) => {
        messageContent += `• ${file.filename} (${(file.size / 1024).toFixed(1)}KB)\n`;
      });
    }

    const messageId = await convex.mutation(api.messages.createInChannel, {
      channelId: session.channelId as Id<"channels">,
      content: messageContent,
      fromUser: session.userName || "Iris",
    });

    // Step 2: Create loop and link message
    const loopId = await convex.mutation(api.loops.create, {
      channelId: session.channelId as Id<"channels">,
      messageId: messageId as Id<"messages">,
      title: session.title,
      assigneeIds: (session.assigneeIds || []) as Id<"agents">[],
      createdBy: session.userName || "Iris",
    });

    // Step 3: Update message to belong to loop
    await convex.mutation(api.messages.updateLoopId, {
      messageId: messageId as Id<"messages">,
      loopId: loopId as Id<"loops">,
    });

    return loopId as string;
  } catch (error) {
    console.error("Error creating loop:", error);
    throw error;
  }
}
