// src/features/reports/components/ReportListView.tsx

import type { FinancialReportPeriod } from "@/types/financialReport";
import { formatCurrency, getMonthName } from "@/types/financialReport";
import { FiCalendar, FiCheckCircle, FiClock, FiDownload, FiEye, FiLock, FiFileText, FiTrash2 } from "react-icons/fi";
import React, { useEffect, useState } from "react";
import {
  expensesServiceApi,
  receivedMoneyServiceApi,
  transferredMoneyServiceApi,
} from "../services/financialReport.service.api";

interface ReportListViewProps {
  reports: FinancialReportPeriod[];
  onSelectReport: (report: FinancialReportPeriod) => void;
  onDeleteReport: (id: number) => void;
  onApproveReport: (id: number) => void;
  onFinalizeReport: (id: number) => void;
  selectedReportId?: number;
}

export const ReportListView: React.FC<ReportListViewProps> = ({
  reports,
  onSelectReport,
  onDeleteReport,
  onApproveReport,
  onFinalizeReport,
  selectedReportId,
}) => {
  const [reportTotals, setReportTotals] = useState<
    Record<number, { received: number; expenses: number; transferred: number }>
  >({});

  useEffect(() => {
    const loadTotals = async () => {
      const totals: Record<
        number,
        { received: number; expenses: number; transferred: number }
      > = {};

      for (const report of reports) {
        try {
          const [received, expenses, transferred] = await Promise.all([
            receivedMoneyServiceApi.getByReportPeriod(report.id),
            expensesServiceApi.getByReportPeriod(report.id),
            transferredMoneyServiceApi.getByReportPeriod(report.id),
          ]);

          totals[report.id] = {
            received: received.reduce(
              (sum, item) => sum + (item.amount || 0),
              0,
            ),
            expenses: expenses.reduce(
              (sum, item) => sum + (item.amount || 0),
              0,
            ),
            transferred: transferred.reduce(
              (sum, item) => sum + (item.amount || 0),
              0,
            ),
          };
        } catch (error) {
          console.error(`Error loading totals for report ${report.id}:`, error);
          totals[report.id] = { received: 0, expenses: 0, transferred: 0 };
        }
      }

      setReportTotals(totals);
    };

    if (reports.length > 0) {
      loadTotals();
    }
  }, [reports]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FiClock className="w-3 h-3" />
            Nháp
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FiCheckCircle className="w-3 h-3" />
            Đã Duyệt
          </span>
        );
      case "finalized":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <FiLock className="w-3 h-3" />
            Hoàn Tất
          </span>
        );
      default:
        return null;
    }
  };

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Chưa có báo cáo
        </h3>
        <p className="text-gray-600">Tạo báo cáo tài chính đầu tiên của bạn</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div
          key={report.id}
          className={`
            bg-white rounded-xl border-2 transition-all cursor-pointer
            ${
              selectedReportId === report.id
                ? "border-indigo-500 shadow-lg"
                : "border-gray-200 hover:border-indigo-300 hover:shadow-md"
            }
          `}
          onClick={() => onSelectReport(report)}
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                  <FiFileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {getMonthName(report.month)} {report.year}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <FiCalendar className="w-4 h-4" />
                    {new Date(report.period_start).toLocaleDateString(
                      "vi-VN",
                    )}{" "}
                    - {new Date(report.period_end).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
              {getStatusBadge(report.status)}
            </div>

            {/* Financial Summary - Match Overview Tab */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Total Received */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs font-medium text-emerald-900">
                    Tổng Tiền Đã Về
                  </p>
                </div>
                <p className="text-lg font-bold text-emerald-900">
                  {formatCurrency(
                    reportTotals[report.id]?.received || 0,
                    "USD",
                  )}
                </p>
              </div>

              {/* Total Expenses */}
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg p-4 border border-rose-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiFileText className="w-4 h-4 text-rose-600" />
                  <p className="text-xs font-medium text-rose-900">
                    Tổng Chi Phí
                  </p>
                </div>
                <p className="text-lg font-bold text-rose-900">
                  {formatCurrency(
                    reportTotals[report.id]?.expenses || 0,
                    "USD",
                  )}
                </p>
              </div>

              {/* Total Transferred */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpCircle className="w-4 h-4 text-orange-600" />
                  <p className="text-xs font-medium text-orange-900">
                    Tổng Tiền Đã CK
                  </p>
                </div>
                <p className="text-lg font-bold text-orange-900">
                  {formatCurrency(
                    reportTotals[report.id]?.transferred || 0,
                    "USD",
                  )}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectReport(report);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <FiEye className="w-4 h-4" />
                Xem Chi Tiết
              </button>

              {report.status === "draft" && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onApproveReport(report.id);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    Duyệt
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Bạn có chắc muốn xóa báo cáo này?")) {
                        onDeleteReport(report.id);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Xóa
                  </button>
                </>
              )}

              {report.status === "approved" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFinalizeReport(report.id);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <FiLock className="w-4 h-4" />
                  Hoàn Tất
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement export
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors ml-auto"
              >
                <FiDownload className="w-4 h-4" />
                Xuất Excel
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
