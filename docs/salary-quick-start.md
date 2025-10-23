# Employee Salary Management - Quick Start Guide

## 🚀 Getting Started

### 1. Access the Salary Page
- Navigate to **"Lương NV"** in the sidebar
- Or go to: `http://localhost:5173/salaries`

### 2. Calculate Monthly Salaries

#### Step 1: Select Period
1. Choose **Year** (e.g., 2025)
2. Choose **Month** (e.g., October = 10)

#### Step 2: Calculate All Salaries
1. Click **"Tính lương tất cả"** button
2. Confirm the calculation
3. Wait for the system to calculate salaries for all employees

**What happens:**
- System fetches all orders with `actual_ship_date` in the selected month
- Calculates artist commission for each employee who drew orders
- Calculates sales commission for each employee who sold orders
- Fetches base salary from employee records
- Fetches costs from `employee_monthly_costs` table
- Saves all records with status = 'draft'

### 3. Review Calculated Salaries

The table shows:
- **Nhân viên**: Employee name and code
- **Kỳ lương**: Salary period (month/year)
- **Lương cơ bản**: Base salary
- **HH Vẽ**: Artist commission (from drawing orders)
- **HH Bán hàng**: Sales commission (from selling orders)
- **Tổng lương**: Total salary (base + commissions + bonus - costs)
- **Trạng thái**: Status badge (draft/approved/paid)

#### Expand Row for Details
Click the **chevron** (▼) to see:
- Number of orders drawn
- Number of orders sold
- Total profit from drawn orders
- Total sales revenue
- Bonuses
- Deductions
- Payment information (if paid)
- Notes

### 4. Approve Salaries

For each salary with status **"Nháp"** (Draft):
1. Review the calculation
2. Click **"Duyệt"** button
3. Confirm approval

**Result:** Status changes to **"Đã duyệt"** (Approved)

### 5. Mark as Paid

For each salary with status **"Đã duyệt"** (Approved):
1. Click **"Đã trả"** button
2. Enter payment date (format: YYYY-MM-DD, e.g., 2025-11-05)
3. Enter payment method (e.g., "Chuyển khoản", "Tiền mặt")
4. Confirm

**Result:** Status changes to **"Đã thanh toán"** (Paid)

## 🔍 Filtering

Use the filter section to narrow down results:

### By Year
Select from dropdown (shows last 5 years)

### By Month
- Select specific month (1-12)
- Or select "Tất cả" to see all months in the year

### By Status
- **Tất cả**: All statuses
- **Nháp**: Draft (calculated but not approved)
- **Đã duyệt**: Approved (ready for payment)
- **Đã thanh toán**: Paid (completed)

### By Employee
- Select specific employee from dropdown
- Or select "Tất cả" to see all employees

## 💡 Understanding Commissions

### Artist Commission (HH Vẽ)
- **Who gets it**: Employee who draws/creates the order
- **Field in orders**: `artist_employee_id`
- **Rate**: Per-order `commission_rate` (0-100%)
- **Base**: `profit_vnd` from each order
- **Formula**: `commission_rate * profit_vnd / 100`

**Example:**
- Order 1: 10% commission on 1,000,000 VND profit = 100,000 VND
- Order 2: 15% commission on 2,000,000 VND profit = 300,000 VND
- **Total Artist Commission**: 400,000 VND

### Sales Commission (HH Bán hàng)
- **Who gets it**: Employee who sells the order
- **Field in orders**: `sales_employee_id`
- **Rate**: Fixed monthly `sales_commission_rate` (default 3%)
- **Base**: Total monthly `order_earnings_vnd`
- **Formula**: `sales_commission_rate * total_order_earnings_vnd / 100`

**Example:**
- Total sales in October: 50,000,000 VND
- Sales commission rate: 3%
- **Total Sales Commission**: 1,500,000 VND

### Dual Role Example
Employee can be both artist and salesperson:

**Nguyen Van A in October 2025:**
- Drew 5 orders → Artist commission: 2,000,000 VND
- Sold 10 orders → Sales commission: 1,500,000 VND
- Base salary: 5,000,000 VND
- Bonus: 500,000 VND
- Cost (insurance): -300,000 VND
- **Total Salary**: 8,700,000 VND

## 📊 Salary Calculation Formula

```
Total Salary = Base Salary 
             + Artist Commission 
             + Sales Commission 
             + Bonus 
             - Cost
```

### Components:

1. **Base Salary** (`base_salary`)
   - From `employees.base_salary`
   - Fixed monthly amount

2. **Artist Commission** (`artist_commission`)
   - Sum of all commissions from orders drawn
   - Each order: `commission_rate * profit_vnd / 100`

3. **Sales Commission** (`sales_commission`)
   - Based on total monthly sales
   - `sales_commission_rate * total_order_earnings_vnd / 100`

4. **Bonus** (`bonus`)
   - Additional bonuses (currently manual)
   - Can be edited in the salary record

5. **Cost** (`cost`)
   - From `employee_monthly_costs` table
   - Deductions like insurance, penalties, advances

## 🔄 Workflow States

### Draft (Nháp)
- ⏱️ Just calculated
- ✏️ Can be edited
- 🔄 Can be recalculated
- ❌ Not yet approved
- **Action**: Review and approve

### Approved (Đã duyệt)
- ✅ Verified and approved
- 📋 Ready for payment
- 🔒 Should not be edited
- **Action**: Mark as paid

### Paid (Đã thanh toán)
- 💰 Payment completed
- 📅 Payment date recorded
- 💳 Payment method recorded
- 🔒 Locked (no changes)
- **Action**: None (completed)

## 🛠️ Common Tasks

### Recalculate a Month
1. Filter by year and month
2. Click "Tính lương tất cả"
3. System will update existing records (upsert)

### Edit a Salary Manually
Currently not available in UI. Use database directly or wait for edit feature.

### Delete a Salary Record
Currently not available in UI. Use database directly or wait for delete feature.

### Export to Excel
Coming soon! (Button placeholder exists)

### View Employee Performance
1. Click chevron to expand row
2. See:
   - Number of orders drawn vs sold
   - Total profit generated
   - Total sales revenue
   - Commission breakdown

## 📝 Best Practices

### 1. Monthly Workflow
- **Day 1-5**: Calculate salaries for previous month
- **Day 6-10**: Review and approve all salaries
- **Day 11-15**: Process payments and mark as paid

### 2. Before Calculating
- ✅ Ensure all orders have `actual_ship_date` set
- ✅ Verify employee `base_salary` is up to date
- ✅ Check `employee_monthly_costs` are entered
- ✅ Confirm commission rates are correct

### 3. Before Approving
- ✅ Review artist commission calculations
- ✅ Review sales commission calculations
- ✅ Verify bonus amounts
- ✅ Check cost deductions
- ✅ Confirm total salary is reasonable

### 4. Before Marking Paid
- ✅ Salary must be approved
- ✅ Payment has been processed
- ✅ Have correct payment date
- ✅ Have correct payment method

## ⚠️ Important Notes

### Order Date vs Ship Date
- Salaries are calculated based on **`actual_ship_date`**, not `order_date`
- Only orders with `actual_ship_date` in the period are included
- Make sure to set ship dates when orders are shipped!

### Commission Rates
- **Artist commission**: Per-order rate stored in `orders.commission_rate`
- **Sales commission**: Monthly rate stored in `employees.sales_commission_rate`
- Different employees can have different sales commission rates

### Costs and Deductions
- Managed in separate `employee_monthly_costs` table
- Can include: insurance, penalties, advances, etc.
- One record per employee per month

### Audit Trail
- System tracks who calculated the salary
- System tracks who approved the salary
- All timestamps are recorded
- Historical rates are preserved

## 🐛 Troubleshooting

### No salaries showing
- ✅ Check if you selected the correct year/month
- ✅ Verify orders exist with `actual_ship_date` in that period
- ✅ Click "Tính lương tất cả" to calculate

### Commission is 0
- ✅ Check if employee is assigned to orders (`artist_employee_id` or `sales_employee_id`)
- ✅ Verify orders have `actual_ship_date` set
- ✅ Check commission rates are not 0
- ✅ Verify profit_vnd and order_earnings_vnd are not 0

### Can't approve
- ✅ Make sure status is "draft"
- ✅ Check for any error messages
- ✅ Refresh the page and try again

### Can't mark as paid
- ✅ Make sure status is "approved"
- ✅ Enter valid date format (YYYY-MM-DD)
- ✅ Enter payment method

## 🎯 Next Features (Coming Soon)

- [ ] Edit salary records in UI
- [ ] Delete salary records in UI
- [ ] Export to Excel
- [ ] Bulk approve multiple salaries
- [ ] Bulk mark as paid
- [ ] Salary history view
- [ ] Employee salary detail page
- [ ] Salary comparison charts
- [ ] Email notifications
- [ ] Print salary slips

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review the technical documentation: `employee-salary-management.md`
3. Check the database schema in migration file
4. Contact system administrator
