// src/features/dashboard/components/charts/ProfitChart.tsx
/**
 * ProfitChart - Refactored to use SharedChart
 * Reduced from ~365 lines to ~120 lines
 */

import { type ChartType, type DataKey, SharedChart } from "@components/charts";
import type { ChartDataPoint } from "@types";
import React, { useMemo, useState } from "react";

interface ProfitChartProps {
  data: ChartDataPoint[];
  currency: "USD" | "VND" | "BOTH";
  chartType?: "line" | "area" | "bar" | "combo";
  height?: number;
  showProfitMargin?: boolean;
  loading?: boolean;
}

export const ProfitChart: React.FC<ProfitChartProps> = ({
                                                          data,
                                                          currency,
                                                          chartType = "line",
                                                          height = 400,
                                                          showProfitMargin = true,
                                                          loading = false
                                                        }) => {
  const [activeTab, setActiveTab] = useState<ChartType>(chartType);

  // Format currency helper
  const formatCurrency = (value: number, curr: "USD" | "VND"): string => {
    if (curr === "VND") {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    } else {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
  };

  // Configure data keys based on currency and chart type
  const dataKeys: DataKey[] = useMemo(() => {
    const keys: DataKey[] = [];

    if (activeTab === "combo") {
      // For combo chart: bars for profit + line for margin
      if (currency === "USD" || currency === "BOTH") {
        keys.push({
          key: "profit_usd",
          name: "Lợi nhuận USD",
          color: "#10b981",
          type: "bar"
        });
      }
      if (currency === "VND" || currency === "BOTH") {
        keys.push({
          key: "profit_vnd",
          name: "Lợi nhuận VND",
          color: "#059669",
          type: "bar"
        });
      }
      if (showProfitMargin) {
        keys.push({
          key: "profit_margin",
          name: "Tỷ lệ lợi nhuận (%)",
          color: "#f59e0b",
          type: "line",
          yAxisId: "right"
        });
      }
    } else {
      // For other chart types
      if (currency === "USD" || currency === "BOTH") {
        keys.push({
          key: "profit_usd",
          name: "Lợi nhuận USD",
          color: "#10b981",
          gradient: activeTab === "area"
        });
      }
      if (currency === "VND" || currency === "BOTH") {
        keys.push({
          key: "profit_vnd",
          name: "Lợi nhuận VND",
          color: "#059669",
          gradient: activeTab === "area"
        });
      }
    }

    return keys;
  }, [currency, activeTab, showProfitMargin]);

  // Tooltip formatter for custom rendering
  const tooltipFormatter = (value: number, dataKey: string): string => {
    if (dataKey === "profit_margin") {
      return `${value.toFixed(1)}%`;
    }
    return formatCurrency(value, dataKey.includes("usd") ? "USD" : "VND");
  };

  // Y-axis formatter
  const yAxisFormatter = (value: number): string => {
    if (currency === "USD") {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `${(value / 1000000).toFixed(0)}M`;
    }
  };

  // Right Y-axis formatter for profit margin
  const rightAxisFormatter = (value: number): string => {
    return `${value.toFixed(0)}%`;
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
          Biểu Đồ Lợi Nhuận
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
          Biểu Đồ Lợi Nhuận
        </h3>

        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          {(["line", "area", "bar", "combo"] as const).map((type) => (
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
              {type === "combo" && "Kết hợp"}
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
        tooltipFormatter={tooltipFormatter}
        currency={currency === "VND" ? "VND" : "USD"}
        showRightAxis={activeTab === "combo" && showProfitMargin}
        rightAxisFormatter={rightAxisFormatter}
      />

      {/* Summary */}
      {data.length > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Lợi nhuận cao nhất:</span>
              <div className="font-medium">
                {formatCurrency(
                  Math.max(
                    ...data.map((d) =>
                      currency === "VND" ? d.profit_vnd : d.profit_usd
                    )
                  ),
                  currency === "VND" ? "VND" : "USD"
                )}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Lợi nhuận thấp nhất:</span>
              <div className="font-medium">
                {formatCurrency(
                  Math.min(
                    ...data.map((d) =>
                      currency === "VND" ? d.profit_vnd : d.profit_usd
                    )
                  ),
                  currency === "VND" ? "VND" : "USD"
                )}
              </div>
            </div>
            {showProfitMargin && (
              <div>
                <span className="text-gray-600">Tỷ lệ lợi nhuận TB:</span>
                <div className="font-medium">
                  {(
                    data.reduce((sum, d) => sum + d.profit_margin, 0) /
                    data.length
                  ).toFixed(1)}
                  %
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
