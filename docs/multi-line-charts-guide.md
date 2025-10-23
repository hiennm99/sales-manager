# Multi-Line Charts Guide

## Overview
All analytics charts in the dashboard support multi-line display, showing multiple data series in a single chart for easy comparison.

## Available Multi-Line Charts

### 1. Revenue by Month Chart
**Location**: `/analytics-dashboard`

**Lines Displayed**:
- **Blue Line**: USD Revenue (Doanh thu USD)
- **Green Line**: VND Revenue (Doanh thu VND)

**Features**:
- Toggle between USD only, VND only, or both currencies
- Growth indicators showing month-over-month changes
- Summary statistics with totals and averages

**Data Source**: `orders` table grouped by `order_date`
- Uses `order_earnings_usd` and `order_earnings_vnd` fields
- Excludes cancelled orders (`general_status_id != 5`)

### 2. Revenue by Employee Chart
**Location**: `/analytics-dashboard`

**Lines Displayed**:
- **Multiple colored lines**: One line per selected employee
- Each line shows that employee's revenue over time

**Features**:
- Select/deselect employees to compare
- Top 5 employees auto-selected by default
- Toggle between USD and VND
- Employee filtering with checkboxes

**Data Source**: `orders` table grouped by `actual_ship_date` and `employee_id`
- Only includes completed orders (`general_status_id = 3`)
- Joins with `employees` table for names and codes

### 3. Orders Status Trends Chart
**Location**: `/analytics-dashboard`

**Lines Displayed**:
- **Blue Line**: Total orders (Tổng đơn hàng)
- **Green Line**: Completed orders (Đơn hoàn thành)
- **Red Line**: Late orders (Đơn trễ hạn)
- **Orange Line**: Pending orders (Đơn chờ xử lý)
- **Gray Line**: Cancelled orders (Đơn đã hủy)

**Features**:
- Select which metrics to display (customizable)
- Performance indicators (completion rate, late rate)
- Insights section with recommendations

**Data Source**: `orders` table grouped by `order_date`
- Status mapping:
  - `general_status_id = 3`: Completed
  - `general_status_id = 5`: Cancelled
  - Others: Pending
- Late orders: `actual_ship_date > scheduled_ship_date`

### 4. Order Value Analysis Chart
**Location**: `/analytics-dashboard`

**Lines/Bars Displayed**:
- **Combo chart** with bars and lines
- View modes:
  - **Total & Average**: Bars for total value + line for average
  - **Average only**: Single line for average order value
  - **Distribution**: Lines for high/low/medium value orders

**Features**:
- Multiple view modes
- Currency toggle (USD/VND)
- Value classification:
  - High value: > $500 or > 10M VND
  - Low value: < $50 or < 1M VND

**Data Source**: `orders` table grouped by `order_date`
- Uses `order_earnings_usd` and `order_earnings_vnd`
- Excludes cancelled orders

## How Multi-Line Charts Work

### Data Structure
Each chart receives an array of data points. For example, Revenue by Month:

```typescript
[
  {
    month: "2024-01",
    total_earnings_usd: 15000,
    total_earnings_vnd: 350000000,
    order_count: 45
  },
  {
    month: "2024-02",
    total_earnings_usd: 18000,
    total_earnings_vnd: 420000000,
    order_count: 52
  }
]
```

### Chart Configuration
The chart transforms this into Google Charts format:

```javascript
[
  ['Tháng', 'Doanh thu USD', 'Doanh thu VND'],  // Header row
  ['Th01 2024', 15000, 350000000],               // Data row 1
  ['Th02 2024', 18000, 420000000]                // Data row 2
]
```

Each column after the first becomes a separate line in the chart.

### Customization
Each line can be customized with:
- **Color**: Different colors for each line
- **Line width**: Thickness of the line
- **Point size**: Size of data point markers
- **Line style**: Solid or dashed lines

## Database Schema Updates

### Updated Field Names
The analytics service has been updated to use the correct database field names:

**Old Fields** → **New Fields**:
- `total_earnings_usd` → `order_earnings_usd`
- `total_earnings_vnd` → `order_earnings_vnd`
- `status` → `general_status_id` (numeric)
- `expected_ship_date` → `scheduled_ship_date`

### Status ID Mapping
Based on your database:
- `1`: Pending
- `2`: In Progress
- `3`: Completed ✅
- `4`: Shipped
- `5`: Cancelled ❌

## Troubleshooting

### Chart Not Displaying Lines
1. **Check data**: Ensure the service is returning data
2. **Check console**: Look for errors in browser console
3. **Verify fields**: Ensure database field names match the queries
4. **Check filters**: Some charts filter by status or employee

### Lines Not Visible
1. **Check currency selection**: Make sure "both" is selected for Revenue by Month
2. **Check employee selection**: For employee chart, ensure employees are selected
3. **Check metric selection**: For status trends, ensure metrics are checked

### Data Not Loading
1. **Verify database connection**: Check Supabase connection
2. **Check date range**: Ensure there's data in the selected time period
3. **Verify status IDs**: Ensure status ID mapping matches your database

## Example Usage

### Accessing the Dashboard
Navigate to: `http://localhost:5173/analytics-dashboard`

### Viewing Multi-Line Charts
1. **Revenue by Month**: Select "USD + VND" to see both lines
2. **Revenue by Employee**: Check multiple employees to compare
3. **Order Status Trends**: Select all 5 metrics to see all lines
4. **Order Value**: Switch between view modes

### Filtering Data
- Use the time range selector (3, 6, 12, 24 months)
- Use individual chart filters (currency, employees, metrics)
- Refresh individual charts or all at once

## Performance Tips

1. **Limit time range**: Shorter time ranges load faster
2. **Limit employees**: Select fewer employees for faster rendering
3. **Use fallback**: Fallback charts load faster than Google Charts
4. **Cache data**: Data is loaded once and cached until refresh

## Future Enhancements

Potential improvements:
- Export charts as images
- Download data as CSV/Excel
- Custom date range picker
- Real-time data updates
- Comparison with previous periods
- Forecasting and predictions
