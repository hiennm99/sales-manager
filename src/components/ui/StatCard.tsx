// src/components/ui/StatCard.tsx

import { TrendingDown, TrendingUp } from "lucide-react";
import React from "react";

// Định nghĩa props cho component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "blue" | "purple" | "green" | "orange" | "pink" | "cyan";
}

// Định nghĩa màu sắc cho từng variant
const variantStyles = {
  blue: {
    gradient: "from-blue-500/10 via-blue-400/5 to-transparent",
    iconBg: "bg-gradient-to-br from-blue-100 to-blue-50",
    iconColor: "text-blue-600",
    accentLine: "from-blue-500 via-blue-400 to-cyan-400",
    hoverBorder: "group-hover:border-blue-200",
    hoverShadow: "group-hover:shadow-blue-100/50",
  },
  purple: {
    gradient: "from-purple-500/10 via-purple-400/5 to-transparent",
    iconBg: "bg-gradient-to-br from-purple-100 to-purple-50",
    iconColor: "text-purple-600",
    accentLine: "from-purple-500 via-fuchsia-400 to-pink-400",
    hoverBorder: "group-hover:border-purple-200",
    hoverShadow: "group-hover:shadow-purple-100/50",
  },
  green: {
    gradient: "from-green-500/10 via-green-400/5 to-transparent",
    iconBg: "bg-gradient-to-br from-green-100 to-emerald-50",
    iconColor: "text-green-600",
    accentLine: "from-green-500 via-emerald-400 to-teal-400",
    hoverBorder: "group-hover:border-green-200",
    hoverShadow: "group-hover:shadow-green-100/50",
  },
  orange: {
    gradient: "from-orange-500/10 via-orange-400/5 to-transparent",
    iconBg: "bg-gradient-to-br from-orange-100 to-amber-50",
    iconColor: "text-orange-600",
    accentLine: "from-orange-500 via-amber-400 to-yellow-400",
    hoverBorder: "group-hover:border-orange-200",
    hoverShadow: "group-hover:shadow-orange-100/50",
  },
  pink: {
    gradient: "from-pink-500/10 via-pink-400/5 to-transparent",
    iconBg: "bg-gradient-to-br from-pink-100 to-rose-50",
    iconColor: "text-pink-600",
    accentLine: "from-pink-500 via-rose-400 to-fuchsia-400",
    hoverBorder: "group-hover:border-pink-200",
    hoverShadow: "group-hover:shadow-pink-100/50",
  },
  cyan: {
    gradient: "from-cyan-500/10 via-cyan-400/5 to-transparent",
    iconBg: "bg-gradient-to-br from-cyan-100 to-sky-50",
    iconColor: "text-cyan-600",
    accentLine: "from-cyan-500 via-sky-400 to-blue-400",
    hoverBorder: "group-hover:border-cyan-200",
    hoverShadow: "group-hover:shadow-cyan-100/50",
  },
};

// Component hiển thị MỘT thẻ stat duy nhất
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  className = "text-gray-900",
  trend,
  variant = "blue",
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      className={`group relative bg-white rounded-xl border border-gray-200/70 p-6 shadow-sm hover:shadow-lg ${styles.hoverBorder} ${styles.hoverShadow} transition-all duration-300 overflow-hidden`}
    >
      {/* Gradient overlay với màu theo variant */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
      />

      {/* Decorative elements */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-white/50 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-1">
              {title}
            </p>

            {/* Trend indicator */}
            {trend && (
              <div className="flex items-center gap-1 mb-2">
                <span
                  className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                    trend.isPositive
                      ? "bg-gradient-to-r from-green-100 to-emerald-50 text-green-700"
                      : "bg-gradient-to-r from-red-100 to-rose-50 text-red-700"
                  }`}
                >
                  {trend.isPositive ? (
                    <TrendingUp size={12} strokeWidth={3} />
                  ) : (
                    <TrendingDown size={12} strokeWidth={3} />
                  )}
                  {Math.abs(trend.value)}%
                </span>
              </div>
            )}
          </div>

          {/* Icon with animated background */}
          <div
            className={`flex-shrink-0 p-3.5 rounded-xl ${styles.iconBg} ${styles.iconColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm`}
          >
            {icon}
          </div>
        </div>

        {/* Value with animation */}
        <div className="flex items-baseline gap-2">
          <p
            className={`text-4xl font-extrabold ${className} tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left`}
          >
            {value}
          </p>
        </div>

        {/* Small description text */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
          <div className={`w-1.5 h-1.5 rounded-full ${styles.iconBg}`} />
          <span>Xem chi tiết</span>
        </div>
      </div>

      {/* Bottom accent line với gradient màu */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${styles.accentLine} opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg`}
      />
    </div>
  );
};

// Component layout Grid để chứa các thẻ StatCard
interface StatGridProps {
  children: React.ReactNode;
}

export const StatGrid: React.FC<StatGridProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
      {children}
    </div>
  );
};
