# Dashboard Feature Documentation

## Overview
The Dashboard feature provides a comprehensive overview of business operations with real-time statistics, charts, and insights.

## Features

### 1. **Statistics Cards**
- **Total Orders**: Shows total order count with month-over-month growth
- **Total Revenue**: Displays total revenue in USD with growth trend
- **Total Profit**: Shows total profit with growth percentage
- **Average Order Value**: Calculates average revenue per order

### 2. **Revenue & Profit Chart**
- Displays revenue and profit trends for the last 6 months
- Interactive bar chart with gradient colors
- Shows order count for each month
- Summary totals at the bottom

### 3. **Orders by Status**
- Visual breakdown of orders by their general status
- Progress bars showing percentage distribution
- Color-coded status indicators
- Total order and status count

### 4. **Top Employees**
- Ranks employees by total revenue
- Shows top 5 performing employees
- Displays employee avatars, order count, revenue, and profit
- Medal-style ranking for top 3 performers

### 5. **Recent Orders Table**
- Lists the 10 most recent orders
- Clickable rows to navigate to order details
- Shows customer name, order date, revenue, and profit
- Quick access to order details

### 6. **Monthly Statistics**
- Dedicated section for current month performance
- Compares with previous month
- Shows growth indicators (↑/↓)

## File Structure

```
src/features/dashboard/
├── components/
│   ├── RevenueChart.tsx           # Revenue/profit bar chart
│   ├── TopEmployeesCard.tsx       # Top performers ranking
│   ├── RecentOrdersTable.tsx      # Recent orders list
│   ├── OrdersByStatusChart.tsx    # Status distribution
│   └── index.ts                   # Component exports
├── pages/
│   ├── DashboardPage.tsx          # Main dashboard page
│   └── index.ts                   # Page exports
├── services/
│   └── dashboard.service.api.ts   # API service layer
└── store/
    └── useDashboardStore.ts       # Zustand state management

src/types/
└── dashboard.ts                   # TypeScript type definitions

src/components/ui/
└── StatCard.tsx                   # Reusable stat card component
```

## Data Flow

### Service Layer (`dashboard.service.api.ts`)
Provides methods to fetch aggregated data from Supabase:

- `getStats(dateRange?)` - Overall statistics with growth calculations
- `getRevenueByMonth(months)` - Revenue/profit trends
- `getOrdersByStatus()` - Order distribution by status
- `getTopEmployees(limit)` - Top performing employees
- `getRecentOrders(limit)` - Most recent orders
- `getDashboardData(dateRange?)` - All data in one call

### Store Layer (`useDashboardStore.ts`)
Zustand store for state management:

**State:**
- `stats` - Dashboard statistics
- `revenueByMonth` - Monthly revenue data
- `ordersByStatus` - Status distribution
- `topEmployees` - Top performers
- `recentOrders` - Recent order list
- `isLoading` - Loading state
- `error` - Error message
- `dateRange` - Optional date filter

**Actions:**
- `loadDashboardData()` - Load all data
- `loadStats()` - Load statistics only
- `loadRevenueByMonth()` - Load revenue trends
- `loadOrdersByStatus()` - Load status distribution
- `loadTopEmployees()` - Load top performers
- `loadRecentOrders()` - Load recent orders
- `setDateRange()` - Set date filter
- `clearError()` - Clear error state

### Component Layer

#### DashboardPage
Main page component that:
- Loads dashboard data on mount
- Displays loading and error states
- Renders all dashboard widgets
- Provides refresh functionality

#### RevenueChart
- Displays 6-month revenue and profit trends
- Horizontal bar chart with gradients
- Shows order count per month
- Summary totals

#### TopEmployeesCard
- Ranks employees by revenue
- Medal-style badges for top 3
- Employee avatars and stats
- Progress bars

#### RecentOrdersTable
- Table view of recent orders
- Clickable rows for navigation
- Customer avatars
- Revenue and profit display

#### OrdersByStatusChart
- Status distribution visualization
- Progress bars with percentages
- Color-coded statuses
- Summary cards

## Types

### DashboardStats
```typescript
interface DashboardStats {
    totalOrders: number;
    totalRevenue: number;
    totalProfit: number;
    averageOrderValue: number;
    ordersThisMonth: number;
    revenueThisMonth: number;
    profitThisMonth: number;
    ordersGrowth: number;
    revenueGrowth: number;
    profitGrowth: number;
}
```

### RevenueByMonth
```typescript
interface RevenueByMonth {
    month: string;
    revenue: number;
    profit: number;
    orders: number;
}
```

### OrdersByStatus
```typescript
interface OrdersByStatus {
    statusName: string;
    count: number;
    percentage: number;
}
```

### TopEmployee
```typescript
interface TopEmployee {
    id: number;
    name: string;
    avatar: string | null;
    totalOrders: number;
    totalRevenue: number;
    totalProfit: number;
}
```

### RecentOrder
```typescript
interface RecentOrder {
    id: number;
    order_id: string;
    customer_name: string;
    buyer_paid_usd: number;
    profit_usd: number;
    order_date: string;
    general_status_id: number | null;
}
```

## Usage

### Basic Usage
The dashboard is automatically loaded when navigating to `/dashboard` or the root path `/`.

### Refresh Data
Click the "Làm mới" (Refresh) button in the header to reload all dashboard data.

### Navigate to Orders
Click on any recent order row to navigate to the order detail page.

## Styling

The dashboard uses:
- **Tailwind CSS** for styling
- **Gradient backgrounds** for visual appeal
- **Hover effects** for interactivity
- **Responsive grid layouts** for mobile support
- **Color-coded variants** for different metrics:
  - Blue: Orders
  - Green: Revenue
  - Purple: Profit
  - Orange: Average values

## Performance Considerations

1. **Parallel Data Loading**: All dashboard data is fetched in parallel using `Promise.all()`
2. **Optimized Queries**: Service layer uses efficient Supabase queries
3. **Cached State**: Zustand store caches data to avoid unnecessary refetches
4. **Loading States**: Proper loading indicators prevent UI jank

## Future Enhancements

Potential improvements:
- Date range filtering
- Export to PDF/Excel
- Real-time updates with Supabase subscriptions
- More chart types (pie charts, line charts)
- Drill-down capabilities
- Custom dashboard layouts
- Comparison periods (YoY, QoQ)
- Goal tracking and alerts

## Dependencies

- React
- React Router (navigation)
- Zustand (state management)
- Supabase (database)
- Lucide React (icons)
- Tailwind CSS (styling)

## Database Tables Used

- `orders` - Order data
- `employees` - Employee information
- `statuses` - Order status definitions

## Error Handling

The dashboard includes comprehensive error handling:
- Try-catch blocks in all service methods
- Error state in Zustand store
- User-friendly error messages
- Retry functionality
- Graceful fallbacks for missing data
