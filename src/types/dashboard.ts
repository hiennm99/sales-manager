// types/dashboard.ts

export interface DashboardMetrics {
  // Summary metrics
  totalRevenue: {
    usd: number;
    vnd: number;
  };
  totalProfit: {
    usd: number;
    vnd: number;
  };
  totalOrders: number;
  averageOrderValue: {
    usd: number;
    vnd: number;
  };
  profitMargin: number; // Percentage
  conversionRate: number; // Percentage (delivered orders / total orders)

  // Growth metrics (compared to previous period)
  revenueGrowth: number; // Percentage
  profitGrowth: number; // Percentage
  ordersGrowth: number; // Percentage
}

export interface ChartDataPoint {
  date: string; // ISO date string
  label: string; // Display label (e.g., "Jan 2024")
  revenue_usd: number;
  revenue_vnd: number;
  profit_usd: number;
  profit_vnd: number;
  orders_count: number;
  average_order_value_usd: number;
  profit_margin: number;
}

export interface RevenueChartData {
  monthly: ChartDataPoint[];
  quarterly: ChartDataPoint[];
  yearly: ChartDataPoint[];
}

export interface ProfitChartData {
  monthly: ChartDataPoint[];
  quarterly: ChartDataPoint[];
  yearly: ChartDataPoint[];
}

export interface OrdersChartData {
  monthly: ChartDataPoint[];
  quarterly: ChartDataPoint[];
  yearly: ChartDataPoint[];
}

export interface ShopPerformance {
  shop_id: number;
  shop_name?: string;
  revenue_usd: number;
  revenue_vnd: number;
  profit_usd: number;
  profit_vnd: number;
  orders_count: number;
  profit_margin: number;
}

export interface EmployeePerformance {
  employee_id: number;
  employee_name?: string;
  employee_code?: string;
  revenue_usd: number;
  revenue_vnd: number;
  profit_usd: number;
  profit_vnd: number;
  orders_count: number;
  profit_margin: number;
  commission_earned: number;
}

export interface OrderStatusDistribution {
  status_id: number;
  status_name?: string;
  count: number;
  percentage: number;
  [key: string]: any; // Allow additional properties for chart compatibility
}

export interface DateRange {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

export interface DashboardFilters {
  dateRange: DateRange;
  shopIds?: number[];
  employeeIds?: number[];
  currency: "USD" | "VND" | "BOTH";
  period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
}

export interface DashboardData {
  metrics: DashboardMetrics;
  revenueChart: RevenueChartData;
  profitChart: ProfitChartData;
  ordersChart: OrdersChartData;
  shopPerformance: ShopPerformance[];
  employeePerformance: EmployeePerformance[];
  orderStatusDistribution: OrderStatusDistribution[];
  lastUpdated: string; // ISO timestamp
}

// Trend analysis types
export interface TrendData {
  current: number;
  previous: number;
  change: number; // Absolute change
  changePercentage: number; // Percentage change
  trend: "up" | "down" | "stable";
}

export interface DashboardTrends {
  revenue: TrendData;
  profit: TrendData;
  orders: TrendData;
  averageOrderValue: TrendData;
  profitMargin: TrendData;
}

// Chart configuration types
export interface ChartConfig {
  type: "line" | "bar" | "area" | "pie" | "donut" | "combo";
  title: string;
  subtitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  colors?: string[];
  height?: number;
}

// Widget types for dashboard layout
export interface DashboardWidget {
  id: string;
  type: "metric" | "chart" | "table" | "custom";
  title: string;
  size: "small" | "medium" | "large" | "full";
  position: {
    row: number;
    col: number;
    rowSpan?: number;
    colSpan?: number;
  };
  config?: ChartConfig;
  data?: any;
}

// Helper types for time periods
export type TimePeriod =
  | "today"
  | "yesterday"
  | "last7days"
  | "last30days"
  | "last90days"
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "lastQuarter"
  | "thisYear"
  | "lastYear"
  | "custom";

export interface QuickDateRange {
  label: string;
  value: TimePeriod;
  startDate: string;
  endDate: string;
}

// Export/Import types
export interface DashboardExportData {
  metrics: DashboardMetrics;
  chartData: {
    revenue: ChartDataPoint[];
    profit: ChartDataPoint[];
    orders: ChartDataPoint[];
  };
  shopPerformance: ShopPerformance[];
  employeePerformance: EmployeePerformance[];
  filters: DashboardFilters;
  exportedAt: string;
}
