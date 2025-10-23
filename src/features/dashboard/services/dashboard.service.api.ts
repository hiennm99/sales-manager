// src/features/dashboard/services/dashboard.service.api.ts

import { format } from "date-fns";
import { handleSupabaseError, supabase } from "../../../lib/supabase";
import type {
  ChartDataPoint,
  DashboardData,
  DashboardFilters,
  DashboardMetrics,
  DashboardTrends,
  DateRange,
  EmployeePerformance,
  OrdersChartData,
  OrderStatusDistribution,
  ProfitChartData,
  RevenueChartData,
  ShopPerformance,
  TrendData,
} from "../../../types/dashboard";
import type { Order } from "../../../types/order";

/**
 * Dashboard Service API
 * Handles all dashboard-related data fetching and calculations
 */
export const dashboardServiceApi = {
  /**
   * Get complete dashboard data
   */
  async getDashboardData(filters: DashboardFilters): Promise<DashboardData> {
    try {
      // Fetch orders within date range
      const orders = await this.getOrdersInDateRange(
        filters.dateRange,
        filters.shopIds,
        filters.employeeIds,
      );

      // Calculate all metrics and chart data
      const [
        metrics,
        revenueChart,
        profitChart,
        ordersChart,
        shopPerformance,
        employeePerformance,
        orderStatusDistribution,
      ] = await Promise.all([
        this.calculateMetrics(orders, filters),
        this.getRevenueChartData(filters),
        this.getProfitChartData(filters),
        this.getOrdersChartData(filters),
        this.getShopPerformance(filters),
        this.getEmployeePerformance(filters),
        this.getOrderStatusDistribution(filters),
      ]);

      return {
        metrics,
        revenueChart,
        profitChart,
        ordersChart,
        shopPerformance,
        employeePerformance,
        orderStatusDistribution,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw new Error("Failed to fetch dashboard data");
    }
  },

  /**
   * Get orders within date range with optional filters
   */
  async getOrdersInDateRange(
    dateRange: DateRange,
    shopIds?: number[],
    employeeIds?: number[],
  ): Promise<Order[]> {
    let query = supabase
      .from("orders")
      .select("*")
      .gte("order_date", dateRange.startDate)
      .lte("order_date", dateRange.endDate);

    if (shopIds && shopIds.length > 0) {
      query = query.in("shop_id", shopIds);
    }

    if (employeeIds && employeeIds.length > 0) {
      query = query.in("employee_id", employeeIds);
    }

    const { data, error } = await query.order("order_date", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching orders:", error);
      throw new Error(handleSupabaseError(error));
    }

    // Map Supabase data to Order type with proper date conversion
    return (data || []).map((row) => ({
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    }));
  },

  /**
   * Calculate dashboard metrics
   */
  async calculateMetrics(
    orders: Order[],
    filters: DashboardFilters,
  ): Promise<DashboardMetrics> {
    const totalRevenue = {
      usd: orders.reduce(
        (sum, order) => sum + (order.order_earnings_usd || 0),
        0,
      ),
      vnd: orders.reduce(
        (sum, order) => sum + (order.order_earnings_vnd || 0),
        0,
      ),
    };

    const totalProfit = {
      usd: orders.reduce((sum, order) => sum + (order.profit_usd || 0), 0),
      vnd: orders.reduce((sum, order) => sum + (order.profit_vnd || 0), 0),
    };

    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(
      (order) => order.delivery_status_id === 4,
    ).length; // Assuming 4 = delivered

    const averageOrderValue = {
      usd: totalOrders > 0 ? totalRevenue.usd / totalOrders : 0,
      vnd: totalOrders > 0 ? totalRevenue.vnd / totalOrders : 0,
    };

    const profitMargin =
      totalRevenue.usd > 0 ? (totalProfit.usd / totalRevenue.usd) * 100 : 0;
    const conversionRate =
      totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

    // Calculate growth metrics (compare with previous period)
    const previousPeriodOrders = await this.getPreviousPeriodOrders(filters);
    const trends = this.calculateTrends(orders, previousPeriodOrders);

    return {
      totalRevenue,
      totalProfit,
      totalOrders,
      averageOrderValue,
      profitMargin,
      conversionRate,
      revenueGrowth: trends.revenue.changePercentage,
      profitGrowth: trends.profit.changePercentage,
      ordersGrowth: trends.orders.changePercentage,
    };
  },

  /**
   * Get revenue chart data
   */
  async getRevenueChartData(
    filters: DashboardFilters,
  ): Promise<RevenueChartData> {
    const [monthly, quarterly, yearly] = await Promise.all([
      this.getChartDataByPeriod(filters, "monthly"),
      this.getChartDataByPeriod(filters, "quarterly"),
      this.getChartDataByPeriod(filters, "yearly"),
    ]);

    return { monthly, quarterly, yearly };
  },

  /**
   * Get profit chart data
   */
  async getProfitChartData(
    filters: DashboardFilters,
  ): Promise<ProfitChartData> {
    const [monthly, quarterly, yearly] = await Promise.all([
      this.getChartDataByPeriod(filters, "monthly"),
      this.getChartDataByPeriod(filters, "quarterly"),
      this.getChartDataByPeriod(filters, "yearly"),
    ]);

    return { monthly, quarterly, yearly };
  },

  /**
   * Get orders chart data
   */
  async getOrdersChartData(
    filters: DashboardFilters,
  ): Promise<OrdersChartData> {
    const [monthly, quarterly, yearly] = await Promise.all([
      this.getChartDataByPeriod(filters, "monthly"),
      this.getChartDataByPeriod(filters, "quarterly"),
      this.getChartDataByPeriod(filters, "yearly"),
    ]);

    return { monthly, quarterly, yearly };
  },

  /**
   * Get chart data grouped by period
   */
  async getChartDataByPeriod(
    filters: DashboardFilters,
    period: "monthly" | "quarterly" | "yearly",
  ): Promise<ChartDataPoint[]> {
    const { data, error } = await supabase
      .from("orders")
      .select(
        "order_date, order_earnings_usd, order_earnings_vnd, profit_usd, profit_vnd",
      )
      .gte("order_date", filters.dateRange.startDate)
      .lte("order_date", filters.dateRange.endDate)
      .order("order_date", { ascending: true });

    if (error) {
      console.error("Error fetching chart data:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data || data.length === 0) return [];

    // Group data by period
    const groupedData = this.groupDataByPeriod(data, period);

    return Object.entries(groupedData).map(([dateKey, orders]) => {
      const revenue_usd = orders.reduce(
        (sum, order) => sum + (order.order_earnings_usd || 0),
        0,
      );
      const revenue_vnd = orders.reduce(
        (sum, order) => sum + (order.order_earnings_vnd || 0),
        0,
      );
      const profit_usd = orders.reduce(
        (sum, order) => sum + (order.profit_usd || 0),
        0,
      );
      const profit_vnd = orders.reduce(
        (sum, order) => sum + (order.profit_vnd || 0),
        0,
      );
      const orders_count = orders.length;
      const average_order_value_usd =
        orders_count > 0 ? revenue_usd / orders_count : 0;
      const profit_margin =
        revenue_usd > 0 ? (profit_usd / revenue_usd) * 100 : 0;

      return {
        date: dateKey,
        label: this.formatPeriodLabel(dateKey, period),
        revenue_usd,
        revenue_vnd,
        profit_usd,
        profit_vnd,
        orders_count,
        average_order_value_usd,
        profit_margin,
      };
    });
  },

  /**
   * Get shop performance data
   */
  async getShopPerformance(
    filters: DashboardFilters,
  ): Promise<ShopPerformance[]> {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        shop_id,
        order_earnings_usd,
        order_earnings_vnd,
        profit_usd,
        profit_vnd
      `,
      )
      .gte("order_date", filters.dateRange.startDate)
      .lte("order_date", filters.dateRange.endDate);

    if (error) {
      console.error("Error fetching shop performance:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data || data.length === 0) return [];

    // Group by shop_id
    const shopGroups = data.reduce(
      (acc, order) => {
        const shopId = order.shop_id;
        if (!acc[shopId]) {
          acc[shopId] = [];
        }
        acc[shopId].push(order);
        return acc;
      },
      {} as Record<number, any[]>,
    );

    return Object.entries(shopGroups)
      .map(([shopId, orders]) => {
        const revenue_usd = orders.reduce(
          (sum, order) => sum + (order.order_earnings_usd || 0),
          0,
        );
        const revenue_vnd = orders.reduce(
          (sum, order) => sum + (order.order_earnings_vnd || 0),
          0,
        );
        const profit_usd = orders.reduce(
          (sum, order) => sum + (order.profit_usd || 0),
          0,
        );
        const profit_vnd = orders.reduce(
          (sum, order) => sum + (order.profit_vnd || 0),
          0,
        );
        const profit_margin =
          revenue_usd > 0 ? (profit_usd / revenue_usd) * 100 : 0;

        return {
          shop_id: parseInt(shopId),
          revenue_usd,
          revenue_vnd,
          profit_usd,
          profit_vnd,
          orders_count: orders.length,
          profit_margin,
        };
      })
      .sort((a, b) => b.revenue_usd - a.revenue_usd);
  },

  /**
   * Get employee performance data
   */
  async getEmployeePerformance(
    filters: DashboardFilters,
  ): Promise<EmployeePerformance[]> {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        artist_employee_id,
        seller_employee_id,
        order_earnings_usd,
        order_earnings_vnd,
        profit_usd,
        profit_vnd,
        artist_commission_rate
      `,
      )
      .gte("order_date", filters.dateRange.startDate)
      .lte("order_date", filters.dateRange.endDate);

    if (error) {
      console.error("Error fetching employee performance:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data || data.length === 0) return [];

    // Group by employee (artist or seller)
    const employeeGroups: Record<number, any[]> = {};

    data.forEach((order) => {
      // Add to artist employee if exists
      if (order.artist_employee_id) {
        if (!employeeGroups[order.artist_employee_id]) {
          employeeGroups[order.artist_employee_id] = [];
        }
        employeeGroups[order.artist_employee_id].push(order);
      }

      // Add to seller employee if exists
      if (order.seller_employee_id) {
        if (!employeeGroups[order.seller_employee_id]) {
          employeeGroups[order.seller_employee_id] = [];
        }
        employeeGroups[order.seller_employee_id].push(order);
      }
    });

    return Object.entries(employeeGroups)
      .map(([employeeId, orders]) => {
        const revenue_usd = orders.reduce(
          (sum, order) => sum + (order.order_earnings_usd || 0),
          0,
        );
        const revenue_vnd = orders.reduce(
          (sum, order) => sum + (order.order_earnings_vnd || 0),
          0,
        );
        const profit_usd = orders.reduce(
          (sum, order) => sum + (order.profit_usd || 0),
          0,
        );
        const profit_vnd = orders.reduce(
          (sum, order) => sum + (order.profit_vnd || 0),
          0,
        );
        const profit_margin =
          revenue_usd > 0 ? (profit_usd / revenue_usd) * 100 : 0;

        // Calculate commission earned
        const commission_earned = orders.reduce((sum, order) => {
          const commissionRate = order.artist_commission_rate || 0;
          return sum + ((order.profit_usd || 0) * commissionRate) / 100;
        }, 0);

        return {
          employee_id: parseInt(employeeId),
          revenue_usd,
          revenue_vnd,
          profit_usd,
          profit_vnd,
          orders_count: orders.length,
          profit_margin,
          commission_earned,
        };
      })
      .sort((a, b) => b.revenue_usd - a.revenue_usd);
  },

  /**
   * Get order status distribution
   */
  async getOrderStatusDistribution(
    filters: DashboardFilters,
  ): Promise<OrderStatusDistribution[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("general_status_id")
      .gte("order_date", filters.dateRange.startDate)
      .lte("order_date", filters.dateRange.endDate);

    if (error) {
      console.error("Error fetching order status distribution:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data || data.length === 0) return [];

    const totalOrders = data.length;
    const statusGroups = data.reduce(
      (acc, order) => {
        const statusId = order.general_status_id || 0;
        acc[statusId] = (acc[statusId] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    return Object.entries(statusGroups)
      .map(([statusId, count]) => ({
        status_id: parseInt(statusId),
        count,
        percentage: (count / totalOrders) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  },

  /**
   * Get dashboard trends (compare current vs previous period)
   */
  async getDashboardTrends(
    filters: DashboardFilters,
  ): Promise<DashboardTrends> {
    const currentOrders = await this.getOrdersInDateRange(filters.dateRange);
    const previousOrders = await this.getPreviousPeriodOrders(filters);

    return this.calculateTrends(currentOrders, previousOrders);
  },

  /**
   * Helper: Get orders from previous period
   */
  async getPreviousPeriodOrders(filters: DashboardFilters): Promise<Order[]> {
    const currentStart = new Date(filters.dateRange.startDate);
    const currentEnd = new Date(filters.dateRange.endDate);
    const periodLength = currentEnd.getTime() - currentStart.getTime();

    const previousEnd = new Date(currentStart.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - periodLength);

    const previousDateRange = {
      startDate: previousStart.toISOString().split("T")[0],
      endDate: previousEnd.toISOString().split("T")[0],
    };

    return this.getOrdersInDateRange(previousDateRange);
  },

  /**
   * Helper: Calculate trends between current and previous periods
   */
  calculateTrends(
    currentOrders: Order[],
    previousOrders: Order[],
  ): DashboardTrends {
    const calculateTrendData = (
      current: number,
      previous: number,
    ): TrendData => {
      const change = current - previous;
      const changePercentage = previous > 0 ? (change / previous) * 100 : 0;
      const trend = change > 0 ? "up" : change < 0 ? "down" : "stable";

      return { current, previous, change, changePercentage, trend };
    };

    const currentRevenue = currentOrders.reduce(
      (sum, order) => sum + (order.order_earnings_usd || 0),
      0,
    );
    const previousRevenue = previousOrders.reduce(
      (sum, order) => sum + (order.order_earnings_usd || 0),
      0,
    );

    const currentProfit = currentOrders.reduce(
      (sum, order) => sum + (order.profit_usd || 0),
      0,
    );
    const previousProfit = previousOrders.reduce(
      (sum, order) => sum + (order.profit_usd || 0),
      0,
    );

    const currentOrderCount = currentOrders.length;
    const previousOrderCount = previousOrders.length;

    const currentAOV =
      currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;
    const previousAOV =
      previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;

    const currentProfitMargin =
      currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0;
    const previousProfitMargin =
      previousRevenue > 0 ? (previousProfit / previousRevenue) * 100 : 0;

    return {
      revenue: calculateTrendData(currentRevenue, previousRevenue),
      profit: calculateTrendData(currentProfit, previousProfit),
      orders: calculateTrendData(currentOrderCount, previousOrderCount),
      averageOrderValue: calculateTrendData(currentAOV, previousAOV),
      profitMargin: calculateTrendData(
        currentProfitMargin,
        previousProfitMargin,
      ),
    };
  },

  /**
   * Helper: Group data by period
   */
  groupDataByPeriod(
    data: any[],
    period: "monthly" | "quarterly" | "yearly",
  ): Record<string, any[]> {
    return data.reduce(
      (acc, item) => {
        const date = new Date(item.order_date);
        let key: string;

        switch (period) {
          case "monthly":
            key = format(date, "yyyy-MM");
            break;
          case "quarterly":
            key = `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
            break;
          case "yearly":
            key = format(date, "yyyy");
            break;
          default:
            key = format(date, "yyyy-MM");
        }

        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      },
      {} as Record<string, any[]>,
    );
  },

  /**
   * Helper: Format period label for display
   */
  formatPeriodLabel(
    dateKey: string,
    period: "monthly" | "quarterly" | "yearly",
  ): string {
    switch (period) {
      case "monthly":
        return format(new Date(dateKey + "-01"), "MMM yyyy");
      case "quarterly":
        return dateKey;
      case "yearly":
        return dateKey;
      default:
        return dateKey;
    }
  },
};
