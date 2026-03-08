"use client";

import { useState, useRef } from "react";

export default function DealMachineUploadPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Please upload a video file');
      return;
    }

    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    console.log(`Uploading video: ${file.name} (${fileSizeMB} MB)`);

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Get Cloudinary upload signature from API
      const signResponse = await fetch('/api/cloudinary-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder: 'deal-machine-uploads',
          resource_type: 'video'
        })
      });

      if (!signResponse.ok) {
        throw new Error('Failed to get upload signature');
      }

      const { signature, timestamp, cloudName, apiKey, folder } = await signResponse.json();

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', apiKey);
      formData.append('folder', folder);

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
      });

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);
      xhr.send(formData);

      const uploadResult = await uploadPromise;
      console.log('Cloudinary upload result:', uploadResult);

      setVideoUrl(uploadResult.secure_url);

      // Create loop in Mission Control with video
      const loopResponse = await fetch('/api/create-deal-machine-loop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: uploadResult.secure_url,
          videoPublicId: uploadResult.public_id,
          fileName: file.name,
          fileSizeMB: parseFloat(fileSizeMB)
        })
      });

      if (!loopResponse.ok) {
        throw new Error('Failed to create loop');
      }

      const loopData = await loopResponse.json();
      console.log('Loop created:', loopData);

      setSuccess(true);
      setUploadProgress(100);

      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setUploading(false);
        setUploadProgress(0);
        setVideoUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-600 rounded-full mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🚗 Deal Machine Upload
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload your vehicle video and we'll handle the rest
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Make sure VIN, mileage, price, and condition are visible in the video
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />

          {!uploading && !success && (
            <button
              onClick={handleFileSelect}
              className="w-full border-4 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-16 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 group"
            >
              <div className="text-center">
                <svg className="mx-auto h-16 w-16 text-blue-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Click to upload video
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Supports files up to 500MB
                </p>
              </div>
            </button>
          )}

          {uploading && !success && (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-blue-100 dark:bg-blue-900 rounded-full mb-6 animate-pulse">
                <svg className="w-16 h-16 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Uploading...
              </h2>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {uploadProgress}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Please don't close this page
              </p>
            </div>
          )}

          {success && (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-green-100 dark:bg-green-900 rounded-full mb-6 animate-bounce">
                <svg className="w-16 h-16 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ✅ Upload Successful!
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Video uploaded and loop created
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Iris will now process the listing and social media posts
              </p>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-300 font-semibold">
                ❌ {error}
              </p>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Questions? Message Iris in Mission Control
          </p>
        </div>
      </div>
    </div>
  );
}
