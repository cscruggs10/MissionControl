import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    console.log('[Upload] Starting upload...');
    console.log('[Upload] Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'MISSING',
      api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'MISSING',
    });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('[Upload] No file provided in form data');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('[Upload] File received:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('[Upload] File converted to buffer:', buffer.length, 'bytes');

    // Upload to Cloudinary
    console.log('[Upload] Starting Cloudinary upload...');
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'mission-control-videos',
          // Optional: Add transformations for optimization
          // eager: [{ format: 'mp4', video_codec: 'h264' }],
        },
        (error, result) => {
          if (error) {
            console.error('[Upload] Cloudinary error:', error);
            reject(error);
          } else {
            console.log('[Upload] Cloudinary success:', {
              secure_url: result?.secure_url,
              public_id: result?.public_id,
              bytes: result?.bytes,
            });
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: (result as any).secure_url,
      publicId: (result as any).public_id,
      format: (result as any).format,
      duration: (result as any).duration,
      bytes: (result as any).bytes,
    });

  } catch (error) {
    console.error('Error uploading video:', error);
    return NextResponse.json(
      { error: 'Failed to upload video', details: (error as Error).message },
      { status: 500 }
    );
  }
}
