import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, videoPublicId, fileName, fileSizeMB } = await request.json();

    // Get #deal-machine channel
    const channels = await convex.query(api.channels.list, {});
    const dealMachineChannel = channels.find((c: any) => c.name === "deal-machine");

    if (!dealMachineChannel) {
      return NextResponse.json(
        { error: "Deal Machine channel not found" },
        { status: 404 }
      );
    }

    // Get agent IDs
    const agents = await convex.query(api.agents.list, {});
    const wheeljack = agents.find((a: any) => a.name === "Wheeljack"); // CMO Deal Machine
    const jazz = agents.find((a: any) => a.name === "Jazz"); // Designer
    const skyfire = agents.find((a: any) => a.name === "Skyfire"); // Social Media

    // Create initial message with video
    const messageContent = `📹 New vehicle video uploaded: ${fileName} (${fileSizeMB} MB)

🔗 Video: ${videoUrl}

**Next Steps:**
@Wheeljack - Extract vehicle info from video and post to Deal Machine
@Jazz - Edit video for Instagram/Facebook (1:1 square + 9:16 reels)
@Skyfire - Post to social media once Jazz is done

All vehicle info (VIN, mileage, price, condition) is visible in the video.`;

    const message = await convex.mutation(api.messages.createInChannel, {
      channelId: dealMachineChannel._id,
      content: messageContent,
      fromUser: "DM Upload Bot",
      mediaUrl: videoUrl,
      mediaType: "video" as const,
    });

    // Create loop
    const loop = await convex.mutation(api.loops.create, {
      channelId: dealMachineChannel._id,
      messageId: message,
      title: `Vehicle: ${fileName}`,
      createdBy: "DM Upload Bot",
      assigneeIds: [
        wheeljack?._id,
        jazz?._id,
        skyfire?._id,
      ].filter(Boolean) as any,
    });

    // Store video as document
    await convex.mutation(api.documents.create, {
      loopId: loop,
      filename: fileName,
      url: videoUrl,
      mimeType: "video/mp4",
      size: Math.round(fileSizeMB * 1024 * 1024),
      uploadedBy: "DM Upload Bot",
    });

    return NextResponse.json({
      success: true,
      loopId: loop,
      messageId: message._id,
      channelId: dealMachineChannel._id,
      videoUrl,
    });
  } catch (error) {
    console.error("Loop creation error:", error);
    return NextResponse.json(
      { error: "Failed to create loop", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
