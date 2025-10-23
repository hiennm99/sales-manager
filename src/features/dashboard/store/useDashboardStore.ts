// src/features/dashboard/store/useDashboardStore.ts

import {
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subDays,
  subMonths,
  subQuarters,
  subYears,
} from "date-fns";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  DashboardData,
  DashboardFilters,
  DashboardMetrics,
  DashboardTrends,
  QuickDateRange,
  TimePeriod,
} from "../../../types/dashboard";
import { dashboardServiceApi } from "../services/dashboard.service.api";

// Default filters
const getDefaultFilters = (): DashboardFilters => ({
  dateRange: {
    startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    endDate: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  },
  currency: "USD",
  period: "monthly",
});

// Quick date range options
const getQuickDateRanges = (): QuickDateRange[] => {
  const today = new Date();

  return [
    {
      label: "Hôm nay",
      value: "today",
      startDate: format(startOfDay(today), "yyyy-MM-dd"),
      endDate: format(endOfDay(today), "yyyy-MM-dd"),
    },
    {
      label: "Hôm qua",
      value: "yesterday",
      startDate: format(startOfDay(subDays(today, 1)), "yyyy-MM-dd"),
      endDate: format(endOfDay(subDays(today, 1)), "yyyy-MM-dd"),
    },
    {
      label: "7 ngày qua",
      value: "last7days",
      startDate: format(subDays(today, 6), "yyyy-MM-dd"),
      endDate: format(today, "yyyy-MM-dd"),
    },
    {
      label: "30 ngày qua",
      value: "last30days",
      startDate: format(subDays(today, 29), "yyyy-MM-dd"),
      endDate: format(today, "yyyy-MM-dd"),
    },
    {
      label: "90 ngày qua",
      value: "last90days",
      startDate: format(subDays(today, 89), "yyyy-MM-dd"),
      endDate: format(today, "yyyy-MM-dd"),
    },
    {
      label: "Tháng này",
      value: "thisMonth",
      startDate: format(startOfMonth(today), "yyyy-MM-dd"),
      endDate: format(endOfMonth(today), "yyyy-MM-dd"),
    },
    {
      label: "Tháng trước",
      value: "lastMonth",
      startDate: format(startOfMonth(subMonths(today, 1)), "yyyy-MM-dd"),
      endDate: format(endOfMonth(subMonths(today, 1)), "yyyy-MM-dd"),
    },
    {
      label: "Quý này",
      value: "thisQuarter",
      startDate: format(startOfQuarter(today), "yyyy-MM-dd"),
      endDate: format(endOfQuarter(today), "yyyy-MM-dd"),
    },
    {
      label: "Quý trước",
      value: "lastQuarter",
      startDate: format(startOfQuarter(subQuarters(today, 1)), "yyyy-MM-dd"),
      endDate: format(endOfQuarter(subQuarters(today, 1)), "yyyy-MM-dd"),
    },
    {
      label: "Năm này",
      value: "thisYear",
      startDate: format(startOfYear(today), "yyyy-MM-dd"),
      endDate: format(endOfYear(today), "yyyy-MM-dd"),
    },
    {
      label: "Năm trước",
      value: "lastYear",
      startDate: format(startOfYear(subYears(today, 1)), "yyyy-MM-dd"),
      endDate: format(endOfYear(subYears(today, 1)), "yyyy-MM-dd"),
    },
  ];
};

interface DashboardStore {
  // State
  data: DashboardData | null;
  filters: DashboardFilters;
  trends: DashboardTrends | null;
  isLoading: boolean;
  error: string | null;
  lastRefresh: string | null;

  // Quick date ranges
  quickDateRanges: QuickDateRange[];
  selectedQuickRange: TimePeriod | null;

  // Auto-refresh
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  refreshTimer: NodeJS.Timeout | null;

  // Actions
  fetchDashboardData: () => Promise<void>;
  refreshDashboardData: () => Promise<void>;
  updateFilters: (newFilters: Partial<DashboardFilters>) => void;
  setDateRange: (startDate: string, endDate: string) => void;
  setQuickDateRange: (range: TimePeriod) => void;
  setCurrency: (currency: "USD" | "VND" | "BOTH") => void;
  setPeriod: (
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly",
  ) => void;
  addShopFilter: (shopId: number) => void;
  removeShopFilter: (shopId: number) => void;
  addEmployeeFilter: (employeeId: number) => void;
  removeEmployeeFilter: (employeeId: number) => void;
  clearFilters: () => void;
  resetToDefaults: () => void;

  // Trends
  fetchTrends: () => Promise<void>;

  // Auto-refresh
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (seconds: number) => void;

  // Utilities
  exportDashboardData: () => Promise<Blob>;
  getMetricValue: (
    metric: keyof DashboardMetrics,
    currency?: "USD" | "VND",
  ) => number;
  getTrendValue: (trend: keyof DashboardTrends) => number;

  // Error handling
  clearError: () => void;
  setError: (error: string) => void;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      // Initial state
      data: null,
      filters: getDefaultFilters(),
      trends: null,
      isLoading: false,
      error: null,
      lastRefresh: null,
      quickDateRanges: getQuickDateRanges(),
      selectedQuickRange: "thisMonth",
      autoRefresh: false,
      refreshInterval: 300, // 5 minutes
      refreshTimer: null,

      // Fetch dashboard data
      fetchDashboardData: async () => {
        const { filters } = get();
        set({ isLoading: true, error: null });

        try {
          const data = await dashboardServiceApi.getDashboardData(filters);
          set({
            data,
            isLoading: false,
            lastRefresh: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch dashboard data",
            isLoading: false,
          });
        }
      },

      // Refresh dashboard data
      refreshDashboardData: async () => {
        await get().fetchDashboardData();
      },

      // Update filters
      updateFilters: (newFilters) => {
        const currentFilters = get().filters;
        const updatedFilters = { ...currentFilters, ...newFilters };
        set({ filters: updatedFilters, selectedQuickRange: null });

        // Auto-fetch data when filters change
        get().fetchDashboardData();
      },

      // Set date range
      setDateRange: (startDate, endDate) => {
        get().updateFilters({
          dateRange: { startDate, endDate },
        });
      },

      // Set quick date range
      setQuickDateRange: (range) => {
        const quickRange = get().quickDateRanges.find(
          (qr) => qr.value === range,
        );
        if (quickRange) {
          set({ selectedQuickRange: range });
          get().updateFilters({
            dateRange: {
              startDate: quickRange.startDate,
              endDate: quickRange.endDate,
            },
          });
        }
      },

      // Set currency
      setCurrency: (currency) => {
        get().updateFilters({ currency });
      },

      // Set period
      setPeriod: (period) => {
        get().updateFilters({ period });
      },

      // Add shop filter
      addShopFilter: (shopId) => {
        const { filters } = get();
        const shopIds = filters.shopIds || [];
        if (!shopIds.includes(shopId)) {
          get().updateFilters({
            shopIds: [...shopIds, shopId],
          });
        }
      },

      // Remove shop filter
      removeShopFilter: (shopId) => {
        const { filters } = get();
        const shopIds = filters.shopIds || [];
        get().updateFilters({
          shopIds: shopIds.filter((id) => id !== shopId),
        });
      },

      // Add employee filter
      addEmployeeFilter: (employeeId) => {
        const { filters } = get();
        const employeeIds = filters.employeeIds || [];
        if (!employeeIds.includes(employeeId)) {
          get().updateFilters({
            employeeIds: [...employeeIds, employeeId],
          });
        }
      },

      // Remove employee filter
      removeEmployeeFilter: (employeeId) => {
        const { filters } = get();
        const employeeIds = filters.employeeIds || [];
        get().updateFilters({
          employeeIds: employeeIds.filter((id) => id !== employeeId),
        });
      },

      // Clear filters
      clearFilters: () => {
        set({
          filters: getDefaultFilters(),
          selectedQuickRange: "thisMonth",
        });
        get().fetchDashboardData();
      },

      // Reset to defaults
      resetToDefaults: () => {
        get().stopAutoRefresh();
        set({
          data: null,
          filters: getDefaultFilters(),
          trends: null,
          error: null,
          lastRefresh: null,
          selectedQuickRange: "thisMonth",
          autoRefresh: false,
        });
      },

      // Fetch trends
      fetchTrends: async () => {
        const { filters } = get();

        try {
          const trends = await dashboardServiceApi.getDashboardTrends(filters);
          set({ trends });
        } catch (error) {
          console.error("Error fetching trends:", error);
          set({
            error:
              error instanceof Error ? error.message : "Failed to fetch trends",
          });
        }
      },

      // Start auto-refresh
      startAutoRefresh: () => {
        const { refreshInterval } = get();
        get().stopAutoRefresh(); // Clear existing timer

        const timer = setInterval(() => {
          get().refreshDashboardData();
        }, refreshInterval * 1000);

        set({ autoRefresh: true, refreshTimer: timer });
      },

      // Stop auto-refresh
      stopAutoRefresh: () => {
        const { refreshTimer } = get();
        if (refreshTimer) {
          clearInterval(refreshTimer);
        }
        set({ autoRefresh: false, refreshTimer: null });
      },

      // Set auto-refresh
      setAutoRefresh: (enabled) => {
        if (enabled) {
          get().startAutoRefresh();
        } else {
          get().stopAutoRefresh();
        }
      },

      // Set refresh interval
      setRefreshInterval: (seconds) => {
        set({ refreshInterval: seconds });

        // Restart auto-refresh with new interval if currently enabled
        const { autoRefresh } = get();
        if (autoRefresh) {
          get().startAutoRefresh();
        }
      },

      // Export dashboard data
      exportDashboardData: async () => {
        const { data, filters } = get();
        if (!data) {
          throw new Error("No data to export");
        }

        const exportData = {
          ...data,
          filters,
          exportedAt: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: "application/json",
        });

        return blob;
      },

      // Get metric value
      getMetricValue: (metric, currency = "USD") => {
        const { data } = get();
        if (!data || !data.metrics) return 0;

        const metricValue = data.metrics[metric];

        if (
          typeof metricValue === "object" &&
          metricValue !== null &&
          "usd" in metricValue
        ) {
          return currency === "VND" ? metricValue.vnd : metricValue.usd;
        }

        return typeof metricValue === "number" ? metricValue : 0;
      },

      // Get trend value
      getTrendValue: (trend) => {
        const { trends } = get();
        if (!trends || !trends[trend]) return 0;
        return trends[trend].changePercentage;
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Set error
      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: "dashboard-store",
      partialize: (state) => ({
        filters: state.filters,
        selectedQuickRange: state.selectedQuickRange,
        autoRefresh: state.autoRefresh,
        refreshInterval: state.refreshInterval,
      }),
    },
  ),
);
