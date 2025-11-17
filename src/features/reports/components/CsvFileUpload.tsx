// src/features/reports/components/CsvFileUpload.tsx

import { supabase } from "@lib";
import React, { useRef, useState } from "react";
import { FiCheckCircle, FiDownload, FiFileText, FiTrash2, FiUpload, FiX } from "react-icons/fi";

interface CsvFile {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

interface CsvFileUploadProps {
  reportPeriodId: number;
  shopId: number;
  year: number;
  month: number;
  files: CsvFile[];
  onFilesChange: (files: CsvFile[]) => void;
}

export const CsvFileUpload: React.FC<CsvFileUploadProps> = ({
                                                              reportPeriodId,
                                                              shopId,
                                                              year,
                                                              month,
                                                              files,
                                                              onFilesChange
                                                            }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedFiles: CsvFile[] = [];
      const totalFiles = selectedFiles.length;

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        // Validate file type
        if (!file.name.toLowerCase().endsWith(".csv")) {
          throw new Error(`File "${file.name}" không phải là file CSV`);
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File "${file.name}" vượt quá 10MB`);
        }

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileName = `${reportPeriodId}_${timestamp}_${sanitizedName}`;
        const filePath = `csv-reports/${shopId}/${year}/${month}/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("financial-documents")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("financial-documents")
          .getPublicUrl(filePath);

        uploadedFiles.push({
          id: `${timestamp}_${i}`,
          name: file.name,
          url: urlData.publicUrl,
          size: file.size,
          uploadedAt: new Date().toISOString()
        });

        // Update progress
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      // Add new files to existing files
      onFilesChange([...files, ...uploadedFiles]);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Lỗi khi tải file lên");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (fileToDelete: CsvFile) => {
    if (!confirm(`Bạn có chắc muốn xóa file "${fileToDelete.name}"?`)) return;

    try {
      // Extract path from URL
      const urlParts = fileToDelete.url.split("/");
      const pathIndex = urlParts.indexOf("financial-documents");
      if (pathIndex !== -1) {
        const filePath = urlParts.slice(pathIndex + 1).join("/");

        // Delete from storage
        await supabase.storage.from("financial-documents").remove([filePath]);
      }

      // Remove from list
      onFilesChange(files.filter((f) => f.id !== fileToDelete.id));
    } catch (err: any) {
      console.error("Delete error:", err);
      alert("Lỗi khi xóa file");
    }
  };

  const handleDownload = (file: CsvFile) => {
    window.open(file.url, "_blank");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full">
              <FiUpload className="w-8 h-8 text-indigo-600 animate-pulse" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                Đang tải lên...
              </p>
              <p className="text-sm text-gray-600 mt-1">{uploadProgress}%</p>
            </div>
            <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <FiUpload className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tải lên file CSV
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Kéo thả file hoặc click để chọn nhiều file CSV
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
            >
              Chọn File CSV
            </button>
            <p className="text-xs text-gray-500 mt-3">
              Hỗ trợ: .csv | Tối đa: 10MB/file
            </p>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <FiX className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-900">Lỗi tải file</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4 text-green-600" />
            File đã tải lên ({files.length})
          </h4>

          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FiFileText className="w-5 h-5 text-green-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-semibold text-gray-900 truncate">
                      {file.name}
                    </h5>
                    <p className="text-xs text-gray-600">
                      {formatFileSize(file.size)} •{" "}
                      {new Date(file.uploadedAt).toLocaleString("vi-VN")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(file)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Tải xuống"
                    >
                      <FiDownload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && !isUploading && (
        <div className="text-center py-8">
          <FiFileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-600">
            Chưa có file CSV nào được tải lên
          </p>
        </div>
      )}
    </div>
  );
};
