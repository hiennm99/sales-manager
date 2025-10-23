// src/features/dashboard/components/widgets/SummaryCard.tsx

import { type LucideIcon, Minus, TrendingDown, TrendingUp } from "lucide-react";
import React from "react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    type: "up" | "down" | "stable";
    label?: string;
  };
  currency?: "USD" | "VND";
  loading?: boolean;
  className?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  currency,
  loading = false,
  className = "",
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === "number") {
      if (currency === "VND") {
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      } else if (currency === "USD") {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(val);
      } else {
        return new Intl.NumberFormat("vi-VN").format(val);
      }
    }
    return val.toString();
  };

  const getTrendIcon = () => {
    if (!trend) return null;

    switch (trend.type) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return "text-gray-500";

    switch (trend.type) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  if (loading) {
    return (
      <div
        className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}
      >
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {/* Main Value */}
      <div className="mb-2">
        <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>

      {/* Trend */}
      {trend && (
        <div className="flex items-center space-x-2">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {trend.value > 0 ? "+" : ""}
            {trend.value.toFixed(1)}%
          </span>
          {trend.label && (
            <span className="text-sm text-gray-500">{trend.label}</span>
          )}
        </div>
      )}
    </div>
  );
};
