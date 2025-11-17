// src/features/reports/components/OverviewTab.tsx
// components/OverviewTab.tsx

import { type FinancialReportPeriod, formatCurrency } from "@types";
import React from "react";
import { FiArrowDownCircle, FiArrowUpCircle, FiFileText, FiImage, FiTrendingDown, FiTrendingUp } from "react-icons/fi";

import { ImageUpload } from "./ImageUpload";

interface OverviewTabProps {
  report: FinancialReportPeriod;
  totalReceived?: number;
  totalTransferred?: number;
  totalExpenses?: number;
  onUpdateOverviewImage?: (url: string) => void;
  onDeleteOverviewImage?: () => void;
  overviewImageUrl?: string | null;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
                                                          report,
                                                          totalReceived = 0,
                                                          totalTransferred = 0,
                                                          totalExpenses = 0,
                                                          onUpdateOverviewImage,
                                                          onDeleteOverviewImage,
                                                          overviewImageUrl
                                                        }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Received */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-600 rounded-lg">
              <FiArrowDownCircle className="w-6 h-6 text-white" />
            </div>
            <FiTrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-sm font-medium text-emerald-900 mb-1">
            Tổng Tiền Đã Về
          </h3>
          <p className="text-2xl font-bold text-emerald-900">
            {formatCurrency(totalReceived)}
          </p>
          <p className="text-xs text-emerald-700 mt-2">Received Money</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-6 border border-rose-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-600 rounded-lg">
              <FiFileText className="w-6 h-6 text-white" />
            </div>
            <FiTrendingDown className="w-5 h-5 text-rose-600" />
          </div>
          <h3 className="text-sm font-medium text-rose-900 mb-1">
            Tổng Chi Phí
          </h3>
          <p className="text-2xl font-bold text-rose-900">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="text-xs text-rose-700 mt-2">Total Expenses</p>
        </div>

        {/* Total Transferred */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-600 rounded-lg">
              <FiArrowUpCircle className="w-6 h-6 text-white" />
            </div>
            <FiTrendingDown className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-sm font-medium text-orange-900 mb-1">
            Tổng Tiền Đã Chuyển Khoản
          </h3>
          <p className="text-2xl font-bold text-orange-900">
            {formatCurrency(totalTransferred)}
          </p>
          <p className="text-xs text-orange-700 mt-2">Transferred Money</p>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Chi Tiết Tài Chính
          </h3>
        </div>
      </div>

      {/* Overview Image Upload */}
      {onUpdateOverviewImage && (
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FiImage className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Ảnh Tổng Quan
              </h3>
              <p className="text-xs text-gray-600">
                Tải lên ảnh chụp màn hình tổng quan báo cáo
              </p>
            </div>
          </div>
          <ImageUpload
            label=""
            description="Tải lên ảnh tổng quan báo cáo tài chính (PDF, PNG, JPG)"
            currentImageUrl={overviewImageUrl}
            onUploadSuccess={onUpdateOverviewImage}
            onDelete={onDeleteOverviewImage}
            bucket="financial-documents"
            pathPrefix={`overview/${report.shop_id}/${report.year}/${report.month}`}
            maxSize={15}
          />
        </div>
      )}

      {/* Period Info */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
        <h3 className="text-sm font-semibold text-indigo-900 mb-3">
          Thông Tin Kỳ Báo Cáo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-indigo-700 mb-1">Thời gian</p>
            <p className="text-sm font-medium text-indigo-900">
              {new Date(report.period_start).toLocaleDateString("vi-VN")} -{" "}
              {new Date(report.period_end).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <div>
            <p className="text-xs text-indigo-700 mb-1">Trạng thái</p>
            <span
              className={`
                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${
                report.status === "finalized"
                  ? "bg-green-100 text-green-800"
                  : report.status === "approved"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
              }
                        `}
            >
              {report.status === "finalized"
                ? "Đã Hoàn Tất"
                : report.status === "approved"
                  ? "Đã Duyệt"
                  : "Nháp"}
            </span>
          </div>
        </div>
        {report.notes && (
          <div className="mt-4">
            <p className="text-xs text-indigo-700 mb-1">Ghi chú</p>
            <p className="text-sm text-indigo-900">{report.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};
