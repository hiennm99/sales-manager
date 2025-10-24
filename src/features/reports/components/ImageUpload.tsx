// components/ImageUpload.tsx

import { imageService } from "@/services/imageService.ts";
import { storageService } from "@/services/storageService.ts";
import { FiAlertCircle, FiCheckCircle, FiEye, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import React, { useRef, useState } from "react";

interface ImageUploadProps {
  label: string;
  description?: string;
  currentImageUrl?: string | null;
  onUploadSuccess: (url: string) => void;
  onDelete?: () => void;
  bucket: string;
  pathPrefix: string;
  maxSize?: number; // in MB
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  description,
  currentImageUrl,
  onUploadSuccess,
  onDelete,
  bucket,
  pathPrefix,
  maxSize = 10,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl || null,
  );
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    setSuccess(null);

    // Validate image
    const validation = imageService.validateImage(file, {
      maxSize: maxSize * 1024 * 1024,
      allowedTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf",
      ],
    });

    if (!validation.valid) {
      setError(validation.error || "File không hợp lệ");
      return;
    }

    setIsUploading(true);

    try {
      // Generate preview for images (not PDF)
      if (file.type.startsWith("image/")) {
        const previewUrl = await imageService.generatePreview(file);
        setPreview(previewUrl);
      }

      // Generate unique path
      const timestamp = Date.now();
      const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `${pathPrefix}/${timestamp}_${fileName}`;

      // Upload to Supabase Storage
      const result = await storageService.uploadFile(file, {
        bucket,
        path,
        upsert: true,
      });

      setSuccess(`Đã tải lên thành công: ${file.name}`);
      onUploadSuccess(result.publicUrl);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Không thể tải lên file. Vui lòng thử lại.");
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentImageUrl || !onDelete) return;

    if (!confirm("Bạn có chắc muốn xóa file này?")) return;

    try {
      // Extract path from URL
      const url = new URL(currentImageUrl);
      const pathParts = url.pathname.split("/");
      const path = pathParts.slice(pathParts.indexOf(bucket) + 1).join("/");

      await storageService.deleteFile(bucket, path);
      setPreview(null);
      setSuccess("Đã xóa file thành công");
      onDelete();
    } catch (err) {
      console.error("Error deleting image:", err);
      setError("Không thể xóa file. Vui lòng thử lại.");
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Label */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
        {description && (
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        )}
      </div>

      {/* Current Image Preview */}
      {preview && (
        <div className="relative group">
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            {preview.endsWith(".pdf") || currentImageUrl?.endsWith(".pdf") ? (
              <div className="p-8 text-center">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">PDF Document</p>
              </div>
            ) : (
              <img
                src={preview}
                alt={label}
                className="w-full h-48 object-contain"
              />
            )}
          </div>
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowPreviewModal(true)}
              className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
              title="Xem"
            >
              <FiEye className="w-4 h-4 text-gray-700" />
            </button>
            {onDelete && !disabled && (
              <button
                onClick={handleDelete}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-50 transition-colors"
                title="Xóa"
              >
                <FiTrash2 className="w-4 h-4 text-red-600" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!preview && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
                        relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                        transition-all duration-200
                        ${
                          isDragging
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
                        }
                        ${isUploading || disabled ? "opacity-50 pointer-events-none" : ""}
                    `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />

          <div className="flex flex-col items-center gap-3">
            {isUploading ? (
              <>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <div className="animate-spin">
                    <ImageIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Đang tải lên...
                </p>
              </>
            ) : (
              <>
                <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full">
                  <FiUpload className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Kéo thả file vào đây
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    hoặc click để chọn file
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <ImageIcon className="w-3 h-3" />
                  <span>PNG, JPG, WebP, PDF (tối đa {maxSize}MB)</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <FiAlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-red-900">Lỗi</p>
            <p className="text-xs text-red-700 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <FiX className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <FiCheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-green-900">Thành công</p>
            <p className="text-xs text-green-700 mt-0.5">{success}</p>
          </div>
          <button
            onClick={() => setSuccess(null)}
            className="text-green-600 hover:text-green-800"
          >
            <FiX className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && preview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreviewModal(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <FiX className="w-8 h-8" />
            </button>
            {preview.endsWith(".pdf") || currentImageUrl?.endsWith(".pdf") ? (
              <iframe
                src={preview}
                className="w-full h-[80vh] bg-white rounded-lg"
                title="PDF Preview"
              />
            ) : (
              <img
                src={preview}
                alt={label}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
