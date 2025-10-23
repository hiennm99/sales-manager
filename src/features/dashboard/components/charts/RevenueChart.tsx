// src/features/dashboard/components/charts/RevenueChart.tsx
/**
 * RevenueChart - Refactored to use SharedChart
 * Reduced from ~300 lines to ~100 lines
 */

import React, { useMemo, useState } from "react";
import {
  SharedChart,
  type ChartType,
  type DataKey,
} from "../../../../components/charts/SharedChart";
import type { ChartDataPoint } from "../../../../types/dashboard";

interface RevenueChartProps {
  data: ChartDataPoint[];
  currency: "USD" | "VND" | "BOTH";
  chartType?: "line" | "area" | "bar";
  height?: number;
  showComparison?: boolean;
  loading?: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  currency,
  chartType = "line",
  height = 400,
  showComparison = false,
  loading = false,
}) => {
  const [activeTab, setActiveTab] = useState<ChartType>(chartType);

  // Format currency helper
  const formatCurrency = (value: number, curr: "USD" | "VND"): string => {
    if (curr === "VND") {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    } else {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
  };

  // Configure data keys based on currency
  const dataKeys: DataKey[] = useMemo(() => {
    const keys: DataKey[] = [];

    if (currency === "USD" || currency === "BOTH") {
      keys.push({
        key: "revenue_usd",
        name: "Doanh thu USD",
        color: "#3b82f6",
        gradient: activeTab === "area",
      });
    }

    if (currency === "VND" || currency === "BOTH") {
      keys.push({
        key: "revenue_vnd",
        name: "Doanh thu VND",
        color: "#10b981",
        gradient: activeTab === "area",
      });
    }

    return keys;
  }, [currency, activeTab]);

  // Y-axis formatter
  const yAxisFormatter = (value: number): string => {
    if (currency === "USD") {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `${(value / 1000000).toFixed(0)}M`;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="bg-gray-200 rounded" style={{ height }}></div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Biểu Đồ Doanh Thu
        </h3>
        <div
          className="flex items-center justify-center text-gray-500"
          style={{ height }}
        >
          <div className="text-center">
            <p className="text-lg font-medium">Không có dữ liệu</p>
            <p className="text-sm">Chọn khoảng thời gian khác để xem dữ liệu</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header with Chart Type Selector */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Biểu Đồ Doanh Thu
        </h3>

        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          {(["line", "area", "bar"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === type
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {type === "line" && "Đường"}
              {type === "area" && "Vùng"}
              {type === "bar" && "Cột"}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <SharedChart
        data={data}
        type={activeTab}
        dataKeys={dataKeys}
        height={height}
        yAxisFormatter={yAxisFormatter}
        currency={currency === "VND" ? "VND" : "USD"}
      />

      {/* Summary */}
      {showComparison && data.length > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Cao nhất:</span>
              <span className="ml-2 font-medium">
                {formatCurrency(
                  Math.max(
                    ...data.map((d) =>
                      currency === "VND" ? d.revenue_vnd : d.revenue_usd,
                    ),
                  ),
                  currency === "VND" ? "VND" : "USD",
                )}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Thấp nhất:</span>
              <span className="ml-2 font-medium">
                {formatCurrency(
                  Math.min(
                    ...data.map((d) =>
                      currency === "VND" ? d.revenue_vnd : d.revenue_usd,
                    ),
                  ),
                  currency === "VND" ? "VND" : "USD",
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
