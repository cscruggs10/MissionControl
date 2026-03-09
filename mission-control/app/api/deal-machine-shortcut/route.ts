import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let fileBuffer: Buffer;
    let fileName: string;

    if (contentType.includes("multipart/form-data")) {
      // Form data upload (iOS Shortcuts, HTTP Shortcuts app)
      const formData = await request.formData();
      const file =
        (formData.get("video") as File | null) ||
        (formData.get("file") as File | null);

      if (!file) {
        return NextResponse.json(
          { error: "No video file provided. Send as 'video' or 'file' field." },
          { status: 400 }
        );
      }

      fileName = file.name || "video.mp4";
      fileBuffer = Buffer.from(await file.arrayBuffer());
    } else {
      // Raw binary upload (curl, etc.)
      const bytes = await request.arrayBuffer();
      if (bytes.byteLength === 0) {
        return NextResponse.json(
          { error: "Empty request body" },
          { status: 400 }
        );
      }
      fileBuffer = Buffer.from(bytes);
      fileName =
        request.headers.get("x-filename") ||
        `video-${Date.now()}.mp4`;
    }

    const fileSizeMB = (fileBuffer.length / 1024 / 1024).toFixed(2);

    // Upload to Cloudinary server-side
    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "deal-machine-uploads",
            resource_type: "video",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as { secure_url: string; public_id: string });
          }
        )
        .end(fileBuffer);
    });

    // Get #deal-machine channel
    const channels = await convex.query(api.channels.list, {});
    const dealMachineChannel = channels.find(
      (c: { name: string }) => c.name === "deal-machine"
    );

    if (!dealMachineChannel) {
      return NextResponse.json(
        { error: "Deal Machine channel not found" },
        { status: 404 }
      );
    }

    // Get agent IDs
    const agents = await convex.query(api.agents.list, {});
    const wheeljack = agents.find(
      (a: { name: string }) => a.name === "Wheeljack"
    );
    const jazz = agents.find((a: { name: string }) => a.name === "Jazz");
    const skyfire = agents.find((a: { name: string }) => a.name === "Skyfire");

    const messageContent = `📹 New vehicle video uploaded: ${fileName} (${fileSizeMB} MB)

🔗 Video: ${uploadResult.secure_url}

**Next Steps:**
@Wheeljack - Extract vehicle info from video and post to Deal Machine
@Jazz - Edit video for Instagram/Facebook (1:1 square + 9:16 reels)
@Skyfire - Post to social media once Jazz is done

All vehicle info (VIN, mileage, price, condition) is visible in the video.`;

    const message = await convex.mutation(api.messages.createInChannel, {
      channelId: dealMachineChannel._id,
      content: messageContent,
      fromUser: "DM Upload Bot",
      mediaUrl: uploadResult.secure_url,
      mediaType: "video" as const,
    });

    const loop = await convex.mutation(api.loops.create, {
      channelId: dealMachineChannel._id,
      messageId: message,
      title: `Vehicle: ${fileName}`,
      createdBy: "DM Upload Bot",
      assigneeIds: [wheeljack?._id, jazz?._id, skyfire?._id].filter(
        Boolean
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any,
    });

    return NextResponse.json({
      success: true,
      message: `Video uploaded and loop created! (${fileSizeMB} MB)`,
      loopId: loop,
      videoUrl: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("Shortcut upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
