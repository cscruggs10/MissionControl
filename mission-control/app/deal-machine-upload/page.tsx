"use client";

import { useState, useRef } from "react";

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

export default function DealMachineUploadPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleRecordVideo = () => {
    cameraInputRef.current?.click();
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const resetForm = () => {
    setSuccess(false);
    setUploading(false);
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please upload a video file");
      return;
    }

    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    console.log(`Uploading video: ${file.name} (${fileSizeMB} MB)`);

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const signResponse = await fetch("/api/cloudinary-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder: "deal-machine-uploads",
          resource_type: "video",
        }),
      });

      if (!signResponse.ok) {
        throw new Error("Failed to get upload signature");
      }

      const { signature, timestamp, cloudName, apiKey, folder } =
        await signResponse.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp.toString());
      formData.append("api_key", apiKey);
      formData.append("folder", folder);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      const uploadPromise = new Promise<CloudinaryUploadResult>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText) as CloudinaryUploadResult);
          } else {
            reject(new Error("Upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
      });

      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`
      );
      xhr.send(formData);

      const uploadResult = await uploadPromise;
      console.log("Cloudinary upload result:", uploadResult);

      const loopResponse = await fetch("/api/create-deal-machine-loop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: uploadResult.secure_url,
          videoPublicId: uploadResult.public_id,
          fileName: file.name,
          fileSizeMB: parseFloat(fileSizeMB),
        }),
      });

      if (!loopResponse.ok) {
        throw new Error("Failed to create loop");
      }

      const loopData = await loopResponse.json();
      console.log("Loop created:", loopData);

      setSuccess(true);
      setUploadProgress(100);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-violet-600 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Deal Machine Upload
          </h1>
          <p className="text-lg text-gray-400">
            Record or upload your vehicle walkthrough video
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-[#12121a] border border-gray-800 rounded-2xl shadow-2xl p-6">
          {/* Hidden file inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="video/*"
            capture="environment"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />

          {!uploading && !success && (
            <div className="space-y-4">
              {/* Dual buttons */}
              <button
                onClick={handleRecordVideo}
                className="w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white rounded-xl p-6 transition-colors"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-xl font-semibold">Record Video</span>
                </div>
                <p className="text-violet-200 text-sm mt-1">
                  Opens your camera directly
                </p>
              </button>

              <button
                onClick={handleFileSelect}
                className="w-full bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-white border border-gray-700 rounded-xl p-6 transition-colors"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <span className="text-xl font-semibold">
                    Upload from Library
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  Pick an existing video from your phone
                </p>
              </button>

              {/* Checklist */}
              <div className="mt-6 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                <p className="text-sm font-semibold text-gray-300 mb-2">
                  Before you record, make sure to capture:
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>- VIN number (windshield or door jamb)</li>
                  <li>- Odometer / mileage</li>
                  <li>- Asking price (if posted)</li>
                  <li>- Full exterior walkthrough</li>
                  <li>- Full interior walkthrough</li>
                  <li>- Any damage or wear</li>
                </ul>
              </div>
            </div>
          )}

          {uploading && !success && (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-violet-900/40 rounded-full mb-6 animate-pulse">
                <svg
                  className="w-16 h-16 text-violet-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Uploading...
              </h2>
              <div className="w-full bg-gray-800 rounded-full h-4 mb-4">
                <div
                  className="bg-violet-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-lg font-semibold text-gray-300">
                {uploadProgress}%
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Please don&apos;t close this page
              </p>
            </div>
          )}

          {success && (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-green-900/40 rounded-full mb-6">
                <svg
                  className="w-16 h-16 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Upload Successful!
              </h2>
              <p className="text-gray-400">
                Video uploaded and loop created in Mission Control
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Wheeljack, Jazz, and Skyfire will process this listing
              </p>
              <button
                onClick={resetForm}
                className="mt-8 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
              >
                Upload Another Video
              </button>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
              <p className="text-red-400 font-semibold">{error}</p>
              <button
                onClick={resetForm}
                className="mt-3 text-sm text-red-300 underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Questions? Message Iris in Mission Control</p>
        </div>
      </div>
    </div>
  );
}
