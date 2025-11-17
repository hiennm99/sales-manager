// src/features/orders/components/PreviewPictureUpload.tsx

import { orderPreviewService } from "@features/orders";
import type { OrderPreviewPicture } from "@types";
import React, { useRef, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiUpload, FiX } from "react-icons/fi";

interface PreviewPictureUploadProps {
  orderId: number;
  employeeId?: number;
  onUploadSuccess?: (picture: OrderPreviewPicture) => void;
  onUploadError?: (error: Error) => void;
}

export const PreviewPictureUpload: React.FC<PreviewPictureUploadProps> = ({
                                                                            orderId,
                                                                            employeeId,
                                                                            onUploadSuccess,
                                                                            onUploadError
                                                                          }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const picture = await orderPreviewService.uploadPreviewPicture(
        orderId,
        file,
        employeeId,
        description || undefined
      );

      setDescription("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onUploadSuccess?.(picture);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to upload picture";
      setError(errorMsg);
      onUploadError?.(err instanceof Error ? err : new Error(errorMsg));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-gray-400"
        } ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          disabled={isUploading}
          className="hidden"
        />

        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3"
        >
          {isUploading ? (
            <>
              <AiOutlineLoading3Quarters className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </>
          ) : (
            <>
              <FiUpload className="w-8 h-8 text-gray-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Drag and drop your preview picture here
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  or click to select a file (Max 10MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description field */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Final draft, Customer approved, etc."
          disabled={isUploading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <FiX className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};
