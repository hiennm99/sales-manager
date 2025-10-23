# Financial Reports Feature Guide

## Overview

The Financial Reports feature allows you to upload and manage financial reports from Etsy (or other platforms) with comprehensive tracking across multiple categories.

## Features

### 1. Excel Upload
- **Drag & Drop**: Simply drag your Excel file into the upload area
- **File Validation**: Supports .xlsx, .xls, .ods formats (max 10MB)
- **Automatic Parsing**: Extracts data from multiple sheets automatically

### 2. Report Tabs

#### Tổng Quan (Overview)
- **Total Sales**: Revenue from Etsy
- **Total Fees**: Platform fees and charges
- **Net Profit**: Calculated profit after fees
- **Marketing Fees**: Advertising and promotion costs
- **Profit Margin**: Percentage breakdown

#### Tiền Còn Trên Etsy (Money on Etsy)
- Current balance on platform
- Pending funds
- Available for withdrawal

#### Tiền Đang Về (Incoming Money)
- Expected payments
- Orders in processing
- Estimated arrival dates

#### Tiền Đã Về (Received Money)
- Completed transactions
- Payment dates
- Payment methods

#### Các Chi Phí (Expenses)
- All expenses by category
- Payment tracking
- Receipt management

#### Tiền Đã CK (Transferred Money)
- Bank transfers
- Account details
- Reference numbers

## Excel File Structure

### Required Sheets

Your Excel file should contain the following sheets:

1. **Tổng quan** (or "Activity summary")
   - Month and year
   - Total sales, fees, net profit
   - Marketing fees

2. **Tiền còn trên Etsy**
   - Date, Description, Amount, Currency, Type

3. **Tiền đang về**
   - Date, Order ID, Description, Amount, Currency, Expected Date

4. **Tiền đã về**
   - Date, Order ID, Description, Amount, Currency, Received Date, Payment Method

5. **Các chi phí**
   - Date, Category, Description, Amount, Currency, Payment Method

6. **Tiền đã CK**
   - Date, Description, Amount, Currency, Transfer Date, Bank Account, Reference Number

### Data Format Guidelines

- **Dates**: DD/MM/YYYY or YYYY-MM-DD
- **Numbers**: Use decimal point (e.g., 1234.56)
- **Currency**: USD, VND, or other 3-letter codes
- **Headers**: First row should contain column names

## Usage Instructions

### Step 1: Prepare Your Excel File
1. Download your financial report from Etsy
2. Ensure all required sheets are present
3. Verify data format matches guidelines

### Step 2: Upload File
1. Navigate to **Báo Cáo Tài Chính** page
2. Drag and drop your Excel file or click to select
3. Wait for file processing (usually a few seconds)

### Step 3: Review Data
1. Check the **Tổng Quan** tab for summary
2. Navigate through other tabs to verify data
3. Review all amounts and dates

### Step 4: Save Report
1. Click **Lưu Báo Cáo** button in top-right
2. Wait for confirmation message
3. Report is now saved to database

## Database Tables

### financial_report_periods
Main report period with summary data

### money_on_etsy
Current balance on platform

### incoming_money
Expected incoming payments

### received_money
Completed transactions

### expenses
All expenses and fees

### transferred_money
Bank transfers and withdrawals

## API Services

### financialReportServiceApi
- `getReportPeriods()` - Get all reports
- `getReportPeriod(id)` - Get single report
- `createReportPeriod()` - Create new report
- `updateReportPeriod()` - Update existing report
- `deleteReportPeriod()` - Delete report
- `approveReport()` - Approve report
- `finalizeReport()` - Finalize report

### Data Services
- `moneyOnEtsyServiceApi` - Manage Etsy balance
- `incomingMoneyServiceApi` - Manage incoming payments
- `receivedMoneyServiceApi` - Manage received payments
- `expensesServiceApi` - Manage expenses
- `transferredMoneyServiceApi` - Manage transfers

### excelParserService
- `parseExcelFile(file)` - Parse Excel file and extract data

## Report Status Workflow

1. **Draft** (Nháp)
   - Initial state after upload
   - Can be edited or deleted
   - Not yet approved

2. **Approved** (Đã Duyệt)
   - Reviewed and approved
   - Ready for finalization
   - Cannot be edited without reverting

3. **Finalized** (Đã Hoàn Tất)
   - Locked and archived
   - Cannot be modified
   - Used for historical records

## Tips & Best Practices

### Data Accuracy
- Double-check all amounts before saving
- Verify dates are in correct format
- Ensure currency codes are consistent

### File Organization
- Use consistent naming for Excel files
- Keep original files as backup
- Archive old reports regularly

### Error Handling
- If upload fails, check file format
- Verify file size is under 10MB
- Ensure all required sheets exist

### Performance
- Upload reports during off-peak hours
- Process one report at a time
- Clear browser cache if issues occur

## Troubleshooting

### Upload Errors
**Problem**: File won't upload
**Solution**: 
- Check file format (.xlsx, .xls, .ods)
- Verify file size < 10MB
- Try different browser

**Problem**: Data not parsing correctly
**Solution**:
- Check sheet names match expected format
- Verify column headers are in first row
- Ensure date/number formats are correct

### Display Issues
**Problem**: Amounts showing incorrectly
**Solution**:
- Check currency codes in Excel file
- Verify decimal separators
- Refresh page and try again

**Problem**: Missing data in tabs
**Solution**:
- Verify all sheets exist in Excel file
- Check for empty rows in data
- Re-upload file

## Migration

Run the migration file to create required tables:

```sql
-- migrations/financial_reports.sql
```

This creates:
- All financial report tables
- Indexes for performance
- Triggers for auto-updating timestamps
- Foreign key relationships

## Future Enhancements

- [ ] Multi-currency conversion
- [ ] Automated report generation
- [ ] Email notifications
- [ ] Export to PDF
- [ ] Chart visualizations
- [ ] Comparison between periods
- [ ] Budget tracking
- [ ] Forecasting tools

## Support

For issues or questions:
1. Check this documentation
2. Review error messages
3. Contact system administrator
4. Submit bug report with details

---

**Last Updated**: 2025-10-21
**Version**: 1.0.0
