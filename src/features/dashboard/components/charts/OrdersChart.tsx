// src/features/dashboard/components/charts/OrdersChart.tsx
/**
 * OrdersChart - Refactored to use SharedChart
 * Reduced from ~327 lines to ~110 lines
 */

import React, { useMemo, useState } from "react";
import {
  SharedChart,
  type ChartType,
  type DataKey,
} from "../../../../components/charts/SharedChart";
import type {
  ChartDataPoint,
  OrderStatusDistribution,
} from "../../../../types/dashboard";

interface OrdersChartProps {
  data: ChartDataPoint[];
  statusData?: OrderStatusDistribution[];
  chartType?: "line" | "bar" | "pie";
  height?: number;
  showTrend?: boolean;
  loading?: boolean;
}

const STATUS_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

export const OrdersChart: React.FC<OrdersChartProps> = ({
  data,
  statusData = [],
  chartType = "bar",
  height = 400,
  showTrend = true,
  loading = false,
}) => {
  const [activeTab, setActiveTab] = useState<ChartType>(chartType);

  // Configure data keys based on chart type
  const dataKeys: DataKey[] = useMemo(() => {
    if (activeTab === "pie") {
      return [{ key: "count", name: "Số lượng", color: "#3b82f6" }];
    }

    const keys: DataKey[] = [
      {
        key: "orders_count",
        name: "Số đơn hàng",
        color: "#3b82f6",
      },
    ];

    if (showTrend && activeTab === "line") {
      keys.push({
        key: "average_order_value_usd",
        name: "Giá trị TB ($)",
        color: "#10b981",
        yAxisId: "right",
      });
    }

    return keys;
  }, [activeTab, showTrend]);

  // Tooltip formatter
  const tooltipFormatter = (value: number, dataKey: string): string => {
    if (dataKey === "average_order_value_usd") {
      return `$${value.toFixed(2)}`;
    }
    return value.toLocaleString();
  };

  // Pie chart label
  const pieLabel = (entry: any): string => {
    return `${entry.status_id}: ${entry.percentage.toFixed(1)}%`;
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
          Biểu Đồ Đơn Hàng
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

  // Pie chart with no status data
  if (activeTab === "pie" && (!statusData || statusData.length === 0)) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Biểu Đồ Đơn Hàng
        </h3>
        <div
          className="flex items-center justify-center text-gray-500"
          style={{ height }}
        >
          <div className="text-center">
            <p className="text-lg font-medium">Không có dữ liệu trạng thái</p>
            <p className="text-sm">Chọn tab khác để xem biểu đồ</p>
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
          Biểu Đồ Đơn Hàng
        </h3>

        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          {(["bar", "line", "pie"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === type
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {type === "bar" && "Cột"}
              {type === "line" && "Đường"}
              {type === "pie" && "Tròn"}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <SharedChart
        data={activeTab === "pie" ? statusData : data}
        type={activeTab}
        dataKeys={dataKeys}
        height={height}
        tooltipFormatter={tooltipFormatter}
        pieColors={STATUS_COLORS}
        pieLabel={pieLabel}
        showRightAxis={activeTab === "line" && showTrend}
      />

      {/* Summary */}
      {activeTab !== "pie" && data.length > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Tổng đơn hàng:</span>
              <div className="font-medium">
                {data
                  .reduce((sum, d) => sum + d.orders_count, 0)
                  .toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Cao nhất trong tháng:</span>
              <div className="font-medium">
                {Math.max(...data.map((d) => d.orders_count)).toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Trung bình/tháng:</span>
              <div className="font-medium">
                {Math.round(
                  data.reduce((sum, d) => sum + d.orders_count, 0) /
                    data.length,
                ).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Distribution Summary */}
      {activeTab === "pie" && statusData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Phân bổ trạng thái
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {statusData.slice(0, 4).map((status, index) => (
              <div
                key={status.status_id}
                className="flex items-center space-x-2"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[index] }}
                />
                <span className="text-gray-600">
                  Trạng thái {status.status_id}:
                </span>
                <span className="font-medium">{status.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
