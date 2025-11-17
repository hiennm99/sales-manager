# Dashboard Analytics Guide

## Overview

The Dashboard Analytics feature provides comprehensive business intelligence and performance metrics for the Sales
Manager application. It includes multiple interactive charts and tables to visualize revenue, order statistics, and
employee performance.

## Features

### 1. Revenue by Month Chart

**Multi-line chart showing revenue trends over time**

- **Data Source**: Orders grouped by `order_date`
- **Metrics**:
    - Total Earnings (USD/VND)
    - Total Profit (USD/VND)
- **Features**:
    - Toggle between USD and VND currency
    - Smooth curve visualization
    - Interactive tooltips
    - Last 12 months by default

### 2. Revenue by Employee Chart

**Multi-line chart showing employee revenue performance**

- **Data Source**: Orders grouped by `actual_ship_date` (when orders are shipped)
- **Metrics**:
    - Revenue per employee per month
    - Top 5 employees by default
    - Single employee view when filtered
- **Features**:
    - Color-coded lines for each employee
    - Employee filter dropdown
    - Automatic top performer selection

### 3. Order Statistics Chart

**Multi-line chart showing order fulfillment metrics**

- **Data Source**: Orders grouped by `order_date`
- **Metrics**:
    - Total Orders
    - Completed Orders
    - Late Orders (shipped after scheduled date)
- **Features**:
    - Identify delivery performance trends
    - Track completion rates
    - Monitor late deliveries

### 4. Order Status Distribution

**Pie chart showing order status breakdown**

- **Data Source**: Orders grouped by `general_status_id`
- **Metrics**:
    - Count per status
    - Percentage distribution
- **Features**:
    - Color-coded by status type
    - Interactive donut chart
    - Detailed breakdown table

### 5. Employee Performance Table

**Ranked table of employee metrics**

- **Data Source**: Aggregated order data per employee
- **Metrics**:
    - Total Orders
    - Completed Orders
    - Total Revenue (USD/VND)
    - Total Profit (USD/VND)
    - Average Order Value
    - Completion Rate
    - On-time Delivery Rate
- **Features**:
    - Top 3 highlighted with gold badges
    - Avatar display with initials fallback
    - Sortable by revenue
    - Color-coded completion rates

### 6. Quick Summary Stats

**Key performance indicators at a glance**

- Total Orders
- Completed Orders
- Late Orders
- Total Revenue (USD/VND)

## Technical Implementation

### Architecture

```
src/features/dashboard/
├── components/
│   ├── MultiLineChart.tsx              # Base chart component
│   ├── RevenueByMonthChart.tsx         # Revenue trends
│   ├── RevenueByEmployeeChart.tsx      # Employee performance
│   ├── OrderStatsChart.tsx             # Order metrics
│   ├── OrderStatusDistributionChart.tsx # Status breakdown
│   ├── EmployeePerformanceTable.tsx    # Performance table
│   └── index.ts
├── pages/
│   ├── DashboardPage.tsx               # Main dashboard page
│   └── index.ts
├── services/
│   ├── analytics.service.api.ts        # Data aggregation service
│   └── index.ts
└── index.ts
```

### Data Flow

1. **DashboardPage** loads data on mount
2. **analyticsServiceApi** queries Supabase and aggregates data
3. **Chart Components** receive processed data and render visualizations
4. **Google Charts** library handles chart rendering

### Key Technologies

- **Google Charts**: For multi-line charts and pie charts
- **React**: Component-based UI
- **TypeScript**: Type safety
- **Supabase**: Database queries
- **Tailwind CSS**: Styling

## Database Schema

### Tables Used

1. **orders**
    - `order_date`: For revenue by month grouping
    - `actual_ship_date`: For employee revenue grouping
    - `scheduled_ship_date`: For late order calculation
    - `order_earnings_usd/vnd`: Revenue metrics
    - `profit_usd/vnd`: Profit metrics
    - `employee_id`: Employee attribution
    - `general_status_id`: Order status

2. **employees**
    - `id`: Employee identifier
    - `name`: Employee name
    - `code`: Employee code
    - `avatar`: Profile picture
    - `role`: Job role
    - `is_active`: Active status

3. **general_statuses**
    - `id`: Status identifier
    - `name`: Status code
    - `name_vi`: Vietnamese name
    - `color`: Display color

## API Service Methods

### `analyticsServiceApi.getMonthlyRevenue(filters?)`

Returns monthly revenue data grouped by order_date.

**Parameters:**

- `filters?: DashboardFilters` - Optional filters (dateRange, employeeId, shopId)

**Returns:**

```typescript
MonthlyRevenue[] {
    month: string;              // YYYY-MM
    monthLabel: string;         // Jan 2024
    total_earnings_usd: number;
    total_earnings_vnd: number;
    total_profit_usd: number;
    total_profit_vnd: number;
    order_count: number;
}
```

### `analyticsServiceApi.getRevenueByEmployee(filters?)`

Returns employee revenue data grouped by actual_ship_date.

**Parameters:**

- `filters?: DashboardFilters`

**Returns:**

```typescript
RevenueByEmployee[] {
    employee_id: number;
    employee_name: string;
    employee_avatar: string | null;
    month: string;
    monthLabel: string;
    total_earnings_usd: number;
    total_earnings_vnd: number;
    total_profit_usd: number;
    total_profit_vnd: number;
    order_count: number;
}
```

### `analyticsServiceApi.getMonthlyOrderStats(filters?)`

Returns monthly order statistics including completion and late delivery rates.

**Parameters:**

- `filters?: DashboardFilters`

**Returns:**

```typescript
MonthlyOrderStats[] {
    month: string;
    monthLabel: string;
    total_orders: number;
    completed_orders: number;
    late_orders: number;
    on_time_orders: number;
    completion_rate: number;    // Percentage
    on_time_rate: number;       // Percentage
}
```

### `analyticsServiceApi.getOrderStatusDistribution(filters?)`

Returns order count distribution by status.

**Parameters:**

- `filters?: DashboardFilters`

**Returns:**

```typescript
OrderStatusDistribution[] {
    status_id: number;
    status_name: string;
    status_name_vi: string;
    status_color: string;
    count: number;
    percentage: number;
}
```

### `analyticsServiceApi.getEmployeePerformance(filters?)`

Returns comprehensive employee performance metrics.

**Parameters:**

- `filters?: DashboardFilters`

**Returns:**

```typescript
EmployeePerformance[] {
    employee_id: number;
    employee_name: string;
    employee_code: string;
    employee_avatar: string | null;
    employee_role: string;
    total_orders: number;
    completed_orders: number;
    total_revenue_usd: number;
    total_revenue_vnd: number;
    total_profit_usd: number;
    total_profit_vnd: number;
    average_order_value_usd: number;
    completion_rate: number;
    on_time_delivery_rate: number;
}
```

## Usage

### Basic Usage

The dashboard is automatically loaded when navigating to `/dashboard`:

```typescript
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';

// In router
{
    path: 'dashboard',
    element: <DashboardPage />,
}
```

### Filtering Data

Users can filter dashboard data using:

1. **Employee Filter**: Dropdown to select specific employee
2. **Currency Toggle**: Switch between USD and VND
3. **Date Range**: Default last 12 months (can be extended)

### Customization

To add new charts or metrics:

1. Create new component in `components/`
2. Add data fetching method in `analytics.service.api.ts`
3. Add new type in `src/types/dashboard.ts`
4. Import and use in `DashboardPage.tsx`

## Performance Considerations

1. **Data Aggregation**: Done server-side via Supabase queries
2. **Caching**: Consider implementing React Query for data caching
3. **Lazy Loading**: Charts load after data is fetched
4. **Parallel Requests**: All analytics data fetched in parallel using `Promise.all()`

## Future Enhancements

- [ ] Date range picker for custom periods
- [ ] Export charts as images/PDF
- [ ] Real-time data updates
- [ ] Comparison with previous periods
- [ ] Drill-down functionality
- [ ] Custom dashboard builder
- [ ] Scheduled email reports
- [ ] Mobile-optimized charts

## Troubleshooting

### Charts not displaying

- Ensure Google Charts script is loaded in `index.html`
- Check browser console for errors
- Verify data is being fetched successfully

### Empty data

- Check database has orders with required fields
- Verify date range includes existing orders
- Check employee_id and actual_ship_date are populated

### Performance issues

- Limit date range to reduce data volume
- Consider pagination for large datasets
- Optimize Supabase queries with indexes

## Related Documentation

- [Multi-Line Charts Guide](./multi-line-charts-guide.md)
- [Order Management](./order-management.md)
- [Employee Management](./employee-management.md)
