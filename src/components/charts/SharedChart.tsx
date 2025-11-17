// src/components/charts/SharedChart.tsx
/**
 * SharedChart Component
 * Generic wrapper for Recharts to reduce code duplication
 * Supports: line, area, bar, pie, combo charts
 */

import React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ===========================
// TYPES
// ===========================

export type ChartType = "line" | "area" | "bar" | "pie" | "combo";
export type CurrencyType = "USD" | "VND";

export interface DataKey {
  key: string;
  name: string;
  color: string;
  yAxisId?: string;
  type?: "line" | "bar" | "area";
  gradient?: boolean;
}

export interface SharedChartProps {
  // Data
  data: any[];

  // Chart configuration
  type: ChartType;
  dataKeys: DataKey[];
  xAxisKey?: string;
  height?: number;

  // Appearance
  showLegend?: boolean;
  showGrid?: boolean;
  title?: string;

  // Tooltip & Formatting
  tooltipFormatter?: (value: number, dataKey: string) => string;
  yAxisFormatter?: (value: number) => string;

  // Loading & Empty states
  loading?: boolean;
  emptyMessage?: string;

  // Currency for default formatting
  currency?: CurrencyType;

  // Chart-specific options
  showRightAxis?: boolean;
  rightAxisFormatter?: (value: number) => string;
  pieColors?: string[];
  pieLabel?: (entry: any) => string;
}

// ===========================
// HELPER FUNCTIONS
// ===========================

const formatCurrency = (value: number, currency: CurrencyType): string => {
  if (currency === "VND") {
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

// ===========================
// CUSTOM TOOLTIP
// ===========================

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  tooltipFormatter?: (value: number, dataKey: string) => string;
  currency?: CurrencyType;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  tooltipFormatter,
  // currency = "USD",
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.name}:</span>
            <span className="text-sm font-medium text-gray-900">
              {tooltipFormatter
                ? tooltipFormatter(entry.value, entry.dataKey)
                : typeof entry.value === "number"
                  ? entry.dataKey.includes("usd") ||
                    entry.dataKey.includes("vnd")
                    ? formatCurrency(
                        entry.value,
                        entry.dataKey.includes("usd") ? "USD" : "VND",
                      )
                    : entry.value.toLocaleString()
                  : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ===========================
// MAIN COMPONENT
// ===========================

export const SharedChart: React.FC<SharedChartProps> = ({
  data,
  type,
  dataKeys,
  xAxisKey = "label",
  height = 400,
  showLegend = true,
  showGrid = true,
  title,
  tooltipFormatter,
  yAxisFormatter,
  loading = false,
  emptyMessage = "Không có dữ liệu",
  currency = "USD",
  showRightAxis = false,
  rightAxisFormatter,
  pieColors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#84cc16",
    "#f97316",
  ],
  pieLabel,
}) => {
  // ===========================
  // LOADING STATE
  // ===========================

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          {title && <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>}
          <div className="bg-gray-200 rounded" style={{ height }}></div>
        </div>
      </div>
    );
  }

  // ===========================
  // EMPTY STATE
  // ===========================

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <div
          className="flex items-center justify-center text-gray-500"
          style={{ height }}
        >
          <div className="text-center">
            <p className="text-lg font-medium">{emptyMessage}</p>
            <p className="text-sm">Chọn khoảng thời gian khác để xem dữ liệu</p>
          </div>
        </div>
      </div>
    );
  }

  // ===========================
  // CHART PROPS
  // ===========================

  const commonProps = {
    data,
    margin: { top: 5, right: 30, left: 20, bottom: 5 },
  };

  const xAxisProps = {
    dataKey: xAxisKey,
    tick: { fontSize: 12 },
    tickLine: false,
    axisLine: false,
  };

  const yAxisProps = {
    tick: { fontSize: 12 },
    tickLine: false,
    axisLine: false,
    tickFormatter: yAxisFormatter,
  };

  const rightYAxisProps = showRightAxis
    ? {
        yAxisId: "right",
        orientation: "right" as const,
        tick: { fontSize: 12 },
        tickLine: false,
        axisLine: false,
        tickFormatter: rightAxisFormatter,
      }
    : undefined;

  const gridProps = showGrid
    ? {
        strokeDasharray: "3 3",
        stroke: "#f1f5f9",
      }
    : undefined;

  // ===========================
  // RENDER CHART
  // ===========================

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid {...gridProps} />}
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            {showRightAxis && rightYAxisProps && <YAxis {...rightYAxisProps} />}
            <Tooltip
              content={
                <CustomTooltip
                  tooltipFormatter={tooltipFormatter}
                  currency={currency}
                />
              }
            />
            {showLegend && <Legend />}
            {dataKeys.map((dk) => (
              <Line
                key={dk.key}
                yAxisId={dk.yAxisId}
                type="monotone"
                dataKey={dk.key}
                stroke={dk.color}
                strokeWidth={3}
                dot={{ fill: dk.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: dk.color, strokeWidth: 2 }}
                name={dk.name}
              />
            ))}
          </LineChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid {...gridProps} />}
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            {showRightAxis && rightYAxisProps && <YAxis {...rightYAxisProps} />}
            <Tooltip
              content={
                <CustomTooltip
                  tooltipFormatter={tooltipFormatter}
                  currency={currency}
                />
              }
            />
            {showLegend && <Legend />}
            {dataKeys.map((dk, index) => (
              <Area
                key={dk.key}
                yAxisId={dk.yAxisId}
                type="monotone"
                dataKey={dk.key}
                stackId={dk.gradient ? index + 1 : undefined}
                stroke={dk.color}
                fill={dk.gradient ? `url(#gradient-${dk.key})` : dk.color}
                name={dk.name}
              />
            ))}
            {/* Gradients */}
            <defs>
              {dataKeys
                .filter((dk) => dk.gradient)
                .map((dk) => (
                  <linearGradient
                    key={dk.key}
                    id={`gradient-${dk.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={dk.color} stopOpacity={0.3} />
                    <stop
                      offset="95%"
                      stopColor={dk.color}
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                ))}
            </defs>
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid {...gridProps} />}
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            {showRightAxis && rightYAxisProps && <YAxis {...rightYAxisProps} />}
            <Tooltip
              content={
                <CustomTooltip
                  tooltipFormatter={tooltipFormatter}
                  currency={currency}
                />
              }
            />
            {showLegend && <Legend />}
            {dataKeys.map((dk) => (
              <Bar
                key={dk.key}
                yAxisId={dk.yAxisId}
                dataKey={dk.key}
                fill={dk.color}
                name={dk.name}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case "combo":
        return (
          <ComposedChart {...commonProps}>
            {showGrid && <CartesianGrid {...gridProps} />}
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            {showRightAxis && rightYAxisProps && <YAxis {...rightYAxisProps} />}
            <Tooltip
              content={
                <CustomTooltip
                  tooltipFormatter={tooltipFormatter}
                  currency={currency}
                />
              }
            />
            {showLegend && <Legend />}
            {dataKeys.map((dk) => {
              const componentType = dk.type || "bar";

              if (componentType === "line") {
                return (
                  <Line
                    key={dk.key}
                    yAxisId={dk.yAxisId}
                    type="monotone"
                    dataKey={dk.key}
                    stroke={dk.color}
                    strokeWidth={3}
                    dot={{ fill: dk.color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: dk.color, strokeWidth: 2 }}
                    name={dk.name}
                  />
                );
              } else if (componentType === "area") {
                return (
                  <Area
                    key={dk.key}
                    yAxisId={dk.yAxisId}
                    type="monotone"
                    dataKey={dk.key}
                    stroke={dk.color}
                    fill={dk.gradient ? `url(#gradient-${dk.key})` : dk.color}
                    name={dk.name}
                  />
                );
              } else {
                return (
                  <Bar
                    key={dk.key}
                    yAxisId={dk.yAxisId}
                    dataKey={dk.key}
                    fill={dk.color}
                    name={dk.name}
                    radius={[4, 4, 0, 0]}
                  />
                );
              }
            })}
            {/* Gradients for combo chart */}
            <defs>
              {dataKeys
                .filter((dk) => dk.gradient)
                .map((dk) => (
                  <linearGradient
                    key={dk.key}
                    id={`gradient-${dk.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={dk.color} stopOpacity={0.3} />
                    <stop
                      offset="95%"
                      stopColor={dk.color}
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                ))}
            </defs>
          </ComposedChart>
        );

      case "pie":
        const pieData = data;
        const countKey = dataKeys[0]?.key || "count";

        return (
          <PieChart
            width={400}
            height={400}
            margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
          >
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={pieLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey={countKey}
            >
              {pieData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={pieColors[index % pieColors.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            {showLegend && <Legend />}
          </PieChart>
        );

      default:
        return null;
    }
  };

  // ===========================
  // RENDER
  // ===========================

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      )}

      <div
        style={{ height }}
        className={type === "pie" ? "flex justify-center" : ""}
      >
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
