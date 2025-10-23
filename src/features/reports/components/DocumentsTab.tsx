// components/DocumentsTab.tsx

import type { FinancialReportPeriod } from "@/types/financialReport";
import { FileText } from "lucide-react";
import React, { useEffect, useState } from "react";
import { CsvFileUpload } from "./CsvFileUpload";

interface CsvFile {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

interface DocumentsTabProps {
  report: FinancialReportPeriod;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({ report }) => {
  const [csvFiles, setCsvFiles] = useState<CsvFile[]>([]);

  // Load existing CSV files from report notes (temporary storage)
  useEffect(() => {
    if (report.notes) {
      try {
        const parsed = JSON.parse(report.notes);
        if (Array.isArray(parsed.csvFiles)) {
          setCsvFiles(parsed.csvFiles);
        }
      } catch (e) {
        // Notes might not be JSON, that's ok
      }
    }
  }, [report.notes]);

  const handleFilesChange = (files: CsvFile[]) => {
    setCsvFiles(files);
    // TODO: Save to database via API
    // For now, we'll store in notes field as JSON
    console.log("CSV files updated:", files);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Tài Liệu Báo Cáo CSV
        </h2>
        <p className="text-sm text-gray-600">
          Tải lên các file CSV từ Etsy (Activity summary, Payment reports, v.v.)
        </p>
      </div>

      {/* CSV Files Upload */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              File CSV Báo Cáo
            </h3>
            <p className="text-xs text-gray-600">
              Activity summary, Payment reports, Order details
            </p>
          </div>
        </div>

        <CsvFileUpload
          reportPeriodId={report.id}
          shopId={report.shop_id}
          year={report.year}
          month={report.month}
          files={csvFiles}
          onFilesChange={handleFilesChange}
        />
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <span>💡</span>
          <span>Hướng dẫn</span>
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • <strong>Activity Summary:</strong> Tổng quan hoạt động từ Etsy
          </li>
          <li>
            • <strong>Payment Reports:</strong> Báo cáo thanh toán chi tiết
          </li>
          <li>
            • <strong>Order Details:</strong> Chi tiết đơn hàng và giao dịch
          </li>
          <li>• Tất cả file được lưu trữ an toàn trên Supabase Storage</li>
          <li>• Kích thước tối đa: 10MB/file | Định dạng: .csv</li>
        </ul>
      </div>
    </div>
  );
};
