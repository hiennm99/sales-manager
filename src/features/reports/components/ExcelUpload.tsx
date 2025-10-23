// components/ExcelUpload.tsx

import type { ExcelUploadData } from "@/types/financialReport";
import {
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  Upload,
  X,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { excelParserService } from "../services/financialReport.service.api";

interface ExcelUploadProps {
  onUploadSuccess: (data: ExcelUploadData) => void;
  shopId: number;
}

export const ExcelUpload: React.FC<ExcelUploadProps> = ({
  onUploadSuccess,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

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

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/vnd.oasis.opendocument.spreadsheet",
    ];

    if (
      !validTypes.includes(file.type) &&
      !file.name.match(/\.(xlsx|xls|ods)$/i)
    ) {
      setError("Vui lòng chọn file Excel (.xlsx, .xls, .ods)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File quá lớn. Vui lòng chọn file nhỏ hơn 10MB");
      return;
    }

    setIsUploading(true);

    try {
      const parsedData = await excelParserService.parseExcelFile(file);
      setSuccess(`Đã tải lên thành công: ${file.name}`);
      onUploadSuccess(parsedData);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Error parsing Excel file:", err);
      setError("Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
                    relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                    transition-all duration-200
                    ${
                      isDragging
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
                    }
                    ${isUploading ? "opacity-50 pointer-events-none" : ""}
                `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.ods"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          {isUploading ? (
            <>
              <div className="p-4 bg-indigo-100 rounded-full">
                <div className="animate-spin">
                  <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  Đang xử lý file...
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Vui lòng đợi trong giây lát
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  Kéo thả file Excel vào đây
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  hoặc click để chọn file
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Hỗ trợ: .xlsx, .xls, .ods (tối đa 10MB)</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Lỗi</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">Thành công</p>
            <p className="text-sm text-green-700 mt-1">{success}</p>
          </div>
          <button
            onClick={() => setSuccess(null)}
            className="text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          📋 Hướng dẫn tải file
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • File Excel phải có các sheet: Tổng quan, Tiền còn trên Etsy, Tiền
            đang về, Tiền đã về, Các chi phí, Tiền đã CK
          </li>
          <li>• Dữ liệu phải bắt đầu từ dòng thứ 2 (dòng 1 là tiêu đề)</li>
          <li>• Định dạng số tiền: số thập phân với dấu chấm (VD: 1234.56)</li>
          <li>• Định dạng ngày: DD/MM/YYYY hoặc YYYY-MM-DD</li>
        </ul>
      </div>
    </div>
  );
};
