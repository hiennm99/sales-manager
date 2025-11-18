// src/features/orders/components/PreviewPictureUpload.tsx

import { usePreviewUpload } from "@features/orders/hooks";
import type { OrderPreview } from "@types";
import React, { useRef, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiUpload, FiX } from "react-icons/fi";

interface PreviewPictureUploadProps {
  orderId: number;
  employeeId?: number;
  onUploadSuccess?: (preview: OrderPreview) => void;
  onUploadError?: (error: Error) => void;
}

export const PreviewPictureUpload: React.FC<PreviewPictureUploadProps> = ({
                                                                            orderId,
                                                                            employeeId,
                                                                            onUploadSuccess,
                                                                            onUploadError
                                                                          }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const { uploadPreview, isUploading, error, setError } = usePreviewUpload({
    orderId,
    employeeId,
    onSuccess: onUploadSuccess,
    onError: onUploadError
  });

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
    setError(null);
    
    try {
      await uploadPreview(file);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Upload failed:", err);
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
