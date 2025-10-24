# Employee Salary Management System

## Overview

The employee salary management system provides a comprehensive solution for calculating, tracking, and managing employee salaries with full audit trails and workflow support.

## Database Schema

### Table: `employee_salary`

Stores monthly salary records for each employee with complete breakdown and audit information.

#### Columns:

**Primary Fields:**
- `id` - Primary key (BIGSERIAL)
- `employee_id` - Foreign key to employees table
- `year` - Year (INTEGER)
- `month` - Month 1-12 (INTEGER)
- `period_start` - Period start date (DATE)
- `period_end` - Period end date (DATE)

**Salary Components (VND):**
- `base_salary` - Monthly base salary
- `artist_commission` - Commission from orders drawn (commission_rate % of profit_vnd)
- `sales_commission` - Commission from orders sold (sales_commission_rate % of order_earnings_vnd)
- `bonus` - Additional bonuses
- `cost` - Deductions from employee_monthly_costs table
- `total_salary` - Final salary (base + artist_commission + sales_commission + bonus - cost)

**Performance Metrics:**
- `artist_orders_count` - Number of orders drawn as artist
- `sales_orders_count` - Number of orders sold as salesperson
- `total_profit_vnd` - Total profit from orders drawn
- `total_sales_vnd` - Total sales revenue from orders sold

**Rates (Historical Reference):**
- `artist_commission_rate` - Average commission rate from orders
- `sales_commission_rate` - Sales commission rate used (default 3%)

**Status & Payment:**
- `status` - 'draft', 'approved', or 'paid'
- `payment_date` - Date when salary was paid
- `payment_method` - Payment method (bank transfer, cash, etc.)
- `notes` - Additional notes

**Audit Fields:**
- `calculated_at` - When salary was calculated
- `calculated_by_employee_id` - Who calculated it
- `approved_at` - When salary was approved
- `approved_by_employee_id` - Who approved it
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

**Constraints:**
- UNIQUE(employee_id, year, month) - One record per employee per month

## TypeScript Types

### EmployeeSalary
Complete salary record from database (extends BaseEntity)

### EmployeeSalaryFormData
Form data for creating/updating salary records

### EmployeeSalaryPeriod
Calculated salary data with employee info (for display)

### EmployeeSalaryFilters
Filter options for querying salary records:
- `employee_id?` - Filter by employee
- `year` - Required year
- `month?` - Optional month (if omitted, yearly)
- `status?` - Filter by status (draft/approved/paid)

## Service API Methods

### Calculation Methods

#### `calculateEmployeeSalary(filters: EmployeeSalaryFilters): Promise<EmployeeSalaryPeriod[]>`
Calculates salary for employees based on orders and costs.

**Calculation Logic:**
1. Fetches orders with `actual_ship_date` in the period
2. Groups orders by employee (both artist and sales roles)
3. Calculates artist commission: sum of (commission_rate * profit_vnd / 100)
4. Calculates sales commission: sales_commission_rate % of total order_earnings_vnd
5. Fetches base salary from employee record
6. Fetches costs from employee_monthly_costs table
7. Computes total: base + artist_commission + sales_commission + bonus - cost

**Returns:** Array of EmployeeSalaryPeriod with employee details

#### `getYearlySalaryBreakdown(employee_id: number, year: number): Promise<EmployeeSalaryPeriod[]>`
Gets monthly salary breakdown for an employee for the entire year (12 months).

### Database Methods

#### `getSalaryRecord(employee_id: number, year: number, month: number): Promise<EmployeeSalary | null>`
Retrieves a saved salary record for a specific employee and month.

#### `getSalaryRecords(filters: EmployeeSalaryFilters): Promise<EmployeeSalary[]>`
Retrieves multiple salary records based on filters.

#### `saveSalaryRecord(formData: EmployeeSalaryFormData): Promise<EmployeeSalary>`
Saves or updates a salary record (upsert based on employee_id, year, month).

#### `calculateAndSave(employee_id: number, year: number, month: number, calculated_by_employee_id?: number): Promise<EmployeeSalary>`
Calculates salary and immediately saves it to the database as 'draft' status.

### Workflow Methods

#### `approveSalary(employee_id: number, year: number, month: number, approved_by_employee_id: number): Promise<EmployeeSalary | null>`
Approves a salary record (changes status from 'draft' to 'approved').

#### `markAsPaid(employee_id: number, year: number, month: number, payment_date: string, payment_method: string): Promise<EmployeeSalary | null>`
Marks a salary record as paid with payment details.

#### `deleteSalaryRecord(employee_id: number, year: number, month: number): Promise<void>`
Deletes a salary record.

## Salary Workflow

### 1. Draft Stage
- Manager calculates salary using `calculateAndSave()`
- Status: 'draft'
- Can be edited or recalculated
- Not yet approved

### 2. Approval Stage
- Manager reviews and approves using `approveSalary()`
- Status: 'approved'
- Records who approved and when
- Ready for payment

### 3. Payment Stage
- Accountant marks as paid using `markAsPaid()`
- Status: 'paid'
- Records payment date and method
- Complete audit trail

## Commission System

### Artist Commission
- **Who:** Employee who draws/creates the order (`artist_employee_id`)
- **Rate:** Per-order `commission_rate` (0-100%)
- **Base:** `profit_vnd` from each order
- **Formula:** commission_rate * profit_vnd / 100
- **Example:** 10% commission on 1,000,000 VND profit = 100,000 VND

### Sales Commission
- **Who:** Employee who sells the order (`sales_employee_id`)
- **Rate:** Fixed monthly `sales_commission_rate` (default 3%)
- **Base:** Total monthly `order_earnings_vnd`
- **Formula:** sales_commission_rate * total_order_earnings_vnd / 100
- **Example:** 3% commission on 50,000,000 VND sales = 1,500,000 VND

### Dual Role
An employee can be both artist and salesperson:
- Receives artist commission for orders they draw
- Receives sales commission for orders they sell
- Both commissions are tracked separately

## Usage Examples

### Calculate Monthly Salary
```typescript
import { employeeSalaryService } from '@/features/employees/services/employeeSalary.service.api';

// Calculate for specific employee and month
const salaries = await employeeSalaryService.calculateEmployeeSalary({
  employee_id: 1,
  year: 2025,
  month: 10
});

console.log(salaries[0].total_salary); // Total salary in VND
```

### Calculate and Save
```typescript
// Calculate and save as draft
const savedSalary = await employeeSalaryService.calculateAndSave(
  1,      // employee_id
  2025,   // year
  10,     // month
  5       // calculated_by_employee_id
);

console.log(savedSalary.status); // 'draft'
```

### Approve Salary
```typescript
// Approve the salary
const approved = await employeeSalaryService.approveSalary(
  1,      // employee_id
  2025,   // year
  10,     // month
  5       // approved_by_employee_id
);

console.log(approved.status); // 'approved'
```

### Mark as Paid
```typescript
// Mark as paid
const paid = await employeeSalaryService.markAsPaid(
  1,                  // employee_id
  2025,               // year
  10,                 // month
  '2025-11-05',       // payment_date
  'Bank Transfer'     // payment_method
);

console.log(paid.status); // 'paid'
```

### Get All Salaries for a Month
```typescript
// Get all employee salaries for October 2025
const salaries = await employeeSalaryService.getSalaryRecords({
  year: 2025,
  month: 10
});

salaries.forEach(s => {
  console.log(`Employee ${s.employee_id}: ${s.total_salary} VND (${s.status})`);
});
```

### Get Yearly Breakdown
```typescript
// Get 12-month breakdown for an employee
const breakdown = await employeeSalaryService.getYearlySalaryBreakdown(1, 2025);

breakdown.forEach(month => {
  console.log(`Month ${month.period_start}: ${month.total_salary} VND`);
});
```

## Migration

Run the migration file to create the table:
```sql
-- migrations/add_employee_salary_table.sql
```

This creates:
- `employee_salary` table with all fields
- Indexes for performance
- Trigger for auto-updating `updated_at`
- Comments for documentation

## Benefits

### 1. **Complete Audit Trail**
- Track who calculated, approved, and paid each salary
- Timestamp all actions
- Historical reference of rates used

### 2. **Workflow Support**
- Draft → Approved → Paid workflow
- Prevents accidental payments
- Clear approval process

### 3. **Easy Management**
- Query salaries by employee, period, or status
- Bulk operations support
- Historical data preservation

### 4. **Performance Metrics**
- Track order counts for both roles
- Monitor profit and sales totals
- Analyze employee performance

### 5. **Flexible Calculation**
- Supports dual roles (artist + salesperson)
- Per-order commission rates
- Monthly costs integration
- Bonus support

## Related Tables

- `employees` - Employee master data with base_salary and sales_commission_rate
- `employee_monthly_costs` - Variable monthly costs (insurance, penalties, etc.)
- `orders` - Order data with artist_employee_id, sales_employee_id, profit_vnd, order_earnings_vnd

## Next Steps

1. **Run Migration:** Execute `add_employee_salary_table.sql`
2. **Create UI Components:** Build salary management pages
3. **Add Zustand Store:** Create state management for salary data
4. **Implement Workflow:** Add approval and payment UI
5. **Add Reports:** Create salary reports and analytics
6. **Add Notifications:** Notify employees when salaries are approved/paid
