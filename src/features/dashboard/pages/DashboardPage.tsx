// src/features/dashboard/pages/DashboardPage.tsx
/**
 * DashboardPage - Refactored with Zustand selectors
 * Optimized: Separates data state from actions to reduce re-renders
 */

import { Select } from "@/components/ui/Select";
import { CURRENCY_OPTIONS_SIMPLE } from "@/constants";
import { FiActivity, FiDollarSign, FiDownload, FiRefreshCw, FiShoppingCart, FiTrendingUp } from "react-icons/fi";
import React, { useEffect, useState } from "react";
import {
  DateRangeFilter,
  OrdersChart,
  ProfitChart,
  RevenueChart,
  SummaryCard,
} from "../components";
import { useDashboardStore } from "../store/useDashboardStore";

export const DashboardPage: React.FC = () => {
  // ✅ OPTIMIZED: Separate data subscriptions from actions
  // Data state - triggers re-renders when data changes
  const data = useDashboardStore((state) => state.data);
  const filters = useDashboardStore((state) => state.filters);
  const isLoading = useDashboardStore((state) => state.isLoading);
  const error = useDashboardStore((state) => state.error);

  // Quick ranges and auto-refresh config
  const quickDateRanges = useDashboardStore((state) => state.quickDateRanges);
  const selectedQuickRange = useDashboardStore(
    (state) => state.selectedQuickRange,
  );
  const autoRefresh = useDashboardStore((state) => state.autoRefresh);

  // Actions - never trigger re-renders (stable references)
  const fetchDashboardData = useDashboardStore(
    (state) => state.fetchDashboardData,
  );
  const refreshDashboardData = useDashboardStore(
    (state) => state.refreshDashboardData,
  );
  const setQuickDateRange = useDashboardStore(
    (state) => state.setQuickDateRange,
  );
  const setDateRange = useDashboardStore((state) => state.setDateRange);
  const setCurrency = useDashboardStore((state) => state.setCurrency);
  const setAutoRefresh = useDashboardStore((state) => state.setAutoRefresh);
  const exportDashboardData = useDashboardStore(
    (state) => state.exportDashboardData,
  );
  const clearError = useDashboardStore((state) => state.clearError);

  const [chartPeriod, setChartPeriod] = useState<
    "monthly" | "quarterly" | "yearly"
  >("monthly");

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetchDashboardData is stable from Zustand store

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]); // clearError is stable from Zustand store

  const handleExport = async () => {
    try {
      const blob = await exportDashboardData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dashboard-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const getChartData = () => {
    if (!data) return [];

    switch (chartPeriod) {
      case "quarterly":
        return data.revenueChart.quarterly;
      case "yearly":
        return data.revenueChart.yearly;
      default:
        return data.revenueChart.monthly;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Tổng quan doanh số và hiệu suất kinh doanh
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Auto Refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  autoRefresh
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FiActivity className="w-4 h-4" />
                <span>
                  {autoRefresh ? "Tự động cập nhật" : "Cập nhật thủ công"}
                </span>
              </button>

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={!data}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                <span>Xuất dữ liệu</span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={refreshDashboardData}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                <span>Làm mới</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Date Range Filter */}
            <DateRangeFilter
              selectedRange={selectedQuickRange}
              quickRanges={quickDateRanges}
              customStartDate={filters.dateRange.startDate}
              customEndDate={filters.dateRange.endDate}
              onQuickRangeSelect={setQuickDateRange}
              onCustomRangeSelect={setDateRange}
            />

            {/* Currency Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Tiền tệ:
              </label>
              <Select
                value={filters.currency}
                onChange={(value) =>
                  setCurrency(value as "USD" | "VND" | "BOTH")
                }
                options={[
                  ...CURRENCY_OPTIONS_SIMPLE,
                  { value: "BOTH", label: "Cả hai" },
                ]}
              />
            </div>

            {/* Period Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Chu kỳ:
              </label>
              <Select
                value={chartPeriod}
                onChange={(value) =>
                  setChartPeriod(value as "monthly" | "quarterly" | "yearly")
                }
                options={[
                  { value: "monthly", label: "Theo tháng" },
                  { value: "quarterly", label: "Theo quý" },
                  { value: "yearly", label: "Theo năm" },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={clearError}
                  className="text-red-400 hover:text-red-600"
                >
                  <span className="sr-only">Đóng</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title="Tổng Thu Nhập"
            value={
              data?.metrics.totalRevenue[
                filters.currency === "VND" ? "vnd" : "usd"
              ] || 0
            }
            currency={filters.currency === "VND" ? "VND" : "USD"}
            icon={DollarSign}
            trend={{
              value: data?.metrics.revenueGrowth || 0,
              type: (data?.metrics.revenueGrowth || 0) >= 0 ? "up" : "down",
              label: "so với kỳ trước",
            }}
            loading={isLoading}
          />

          <SummaryCard
            title="Tổng Lợi Nhuận"
            value={
              data?.metrics.totalProfit[
                filters.currency === "VND" ? "vnd" : "usd"
              ] || 0
            }
            currency={filters.currency === "VND" ? "VND" : "USD"}
            icon={TrendingUp}
            trend={{
              value: data?.metrics.profitGrowth || 0,
              type: (data?.metrics.profitGrowth || 0) >= 0 ? "up" : "down",
              label: "so với kỳ trước",
            }}
            loading={isLoading}
          />

          <SummaryCard
            title="Tổng Đơn Hàng"
            value={data?.metrics.totalOrders || 0}
            icon={ShoppingCart}
            trend={{
              value: data?.metrics.ordersGrowth || 0,
              type: (data?.metrics.ordersGrowth || 0) >= 0 ? "up" : "down",
              label: "so với kỳ trước",
            }}
            loading={isLoading}
          />

          <SummaryCard
            title="Tỷ Lệ Lợi Nhuận"
            value={`${(data?.metrics.profitMargin || 0).toFixed(1)}%`}
            icon={BarChart3}
            subtitle="Lợi nhuận / Thu nhập"
            loading={isLoading}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <RevenueChart
            data={getChartData()}
            currency={filters.currency}
            loading={isLoading}
            showComparison={true}
          />

          {/* Profit Chart */}
          <ProfitChart
            data={getChartData()}
            currency={filters.currency}
            loading={isLoading}
            showProfitMargin={true}
          />
        </div>

        {/* Orders Chart */}
        <div className="mb-8">
          <OrdersChart
            data={getChartData()}
            statusData={data?.orderStatusDistribution}
            loading={isLoading}
            showTrend={true}
          />
        </div>

        {/* Performance Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shop Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hiệu Suất Theo Shop
            </h3>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {data?.shopPerformance.slice(0, 5).map((shop, index) => (
                  <div
                    key={shop.shop_id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Shop {shop.shop_id}
                        </p>
                        <p className="text-sm text-gray-500">
                          {shop.orders_count} đơn hàng
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {filters.currency === "VND"
                          ? new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(shop.revenue_vnd)
                          : new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(shop.revenue_usd)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {shop.profit_margin.toFixed(1)}% lợi nhuận
                      </p>
                    </div>
                  </div>
                )) || []}
              </div>
            )}
          </div>

          {/* Employee Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hiệu Suất Nhân Viên
            </h3>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {data?.employeePerformance
                  .slice(0, 5)
                  .map((employee, index) => (
                    <div
                      key={employee.employee_id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-green-600">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            NV {employee.employee_id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {employee.orders_count} đơn hàng
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {filters.currency === "VND"
                            ? new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(employee.revenue_vnd)
                            : new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                              }).format(employee.revenue_usd)}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${employee.commission_earned.toFixed(2)} hoa hồng
                        </p>
                      </div>
                    </div>
                  )) || []}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
