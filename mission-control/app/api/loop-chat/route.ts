import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import {
  LoopCreatorAgent,
  type LoopCreatorSession,
} from "@/lib/loopCreator";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// In-memory session storage (TODO: move to Redis/DB for production)
const sessions = new Map<string, LoopCreatorSession>();

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId = "default" } = await request.json();

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

    // Save session
    sessions.set(sessionId, response.session);

    // Check if we need to create the loop
    if (response.message === "CREATE_LOOP") {
      const loopId = await createLoop(response.session);

      // Clear session
      sessions.delete(sessionId);

      return NextResponse.json({
        message: `✅ Loop created!\n\n📋 ${response.session.title}\n📂 Channel: ${response.session.channelName}\n${response.session.assigneeNames && response.session.assigneeNames.length > 0 ? `👥 Assigned: ${response.session.assigneeNames.join(", ")}\n` : ""}View at: ${process.env.NEXT_PUBLIC_BASE_URL || "http://134.199.192.218:3000"}`,
        timestamp: new Date().toISOString(),
        sessionId,
        loopCreated: true,
        loopId,
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
    const messageContent =
      session.description || `Loop created: ${session.title}`;

    const messageId = await convex.mutation(api.messages.createInChannel, {
      channelId: session.channelId as any,
      content: messageContent,
      fromUser: session.userName || "Loop Creator",
    });

    // Step 2: Create loop and link message
    const loopId = await convex.mutation(api.loops.create, {
      channelId: session.channelId as any,
      messageId: messageId as any,
      title: session.title,
      assigneeIds: (session.assigneeIds || []) as any[],
      createdBy: session.userName || "Loop Creator",
    });

    // Step 3: Update message to belong to loop
    await convex.mutation(api.messages.updateLoopId, {
      messageId: messageId as any,
      loopId: loopId as any,
    });

    return loopId as string;
  } catch (error) {
    console.error("Error creating loop:", error);
    throw error;
  }
}
