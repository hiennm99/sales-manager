# CSV Documents Upload for Financial Reports

## Overview
Multiple CSV file upload system for financial report documents from Etsy (Activity Summary, Payment Reports, Order Details, etc.).

## Features Implemented

### 1. Multiple CSV File Upload
- **Drag & drop** or click to select multiple files
- **CSV validation**: Only .csv files accepted
- **Size limit**: 10MB per file
- **Batch upload**: Upload multiple files at once
- **Progress indicator**: Real-time upload progress
- **Error handling**: Clear error messages

### 2. File Management
- **File list**: Display all uploaded CSV files
- **File details**: Name, size, upload date
- **Download**: Open/download any CSV file
- **Delete**: Remove files with confirmation
- **Empty state**: Helpful message when no files

### 3. Storage Organization
Files are organized in Supabase Storage:
```
financial-documents/
  └── csv-reports/
      └── {shopId}/
          └── {year}/
              └── {month}/
                  └── {reportPeriodId}_{timestamp}_{filename}.csv
```

## Files Created

### Components
1. **CsvFileUpload.tsx** - Main CSV upload component with:
   - Multiple file selection
   - Upload progress tracking
   - File list with actions
   - Download and delete functionality
   - Drag & drop support (UI ready)

### Updated Files
1. **DocumentsTab.tsx** - Simplified to focus on CSV files
2. **components/index.ts** - Export CsvFileUpload
3. **FinancialReportsPage.tsx** - Removed old VAT/Credit handlers

### Database (Optional)
- **Migration**: `migrations/add_csv_documents.sql`
- **Table**: `csv_documents` for proper metadata storage

## Component Usage

### Basic Usage
```tsx
import { CsvFileUpload } from '@/features/reports/components';

<CsvFileUpload
  reportPeriodId={report.id}
  shopId={report.shop_id}
  year={report.year}
  month={report.month}
  files={csvFiles}
  onFilesChange={handleFilesChange}
/>
```

### Props
- `reportPeriodId`: Report period ID
- `shopId`: Shop ID for file organization
- `year`: Year for file organization
- `month`: Month for file organization
- `files`: Array of uploaded files
- `onFilesChange`: Callback when files change

### File Object Structure
```typescript
interface CsvFile {
  id: string;           // Unique identifier
  name: string;         // Original filename
  url: string;          // Supabase Storage URL
  size: number;         // File size in bytes
  uploadedAt: string;   // ISO timestamp
}
```

## User Workflow

### Uploading CSV Files
1. Navigate to report detail view
2. Click **"Tài Liệu"** tab
3. Click **"Chọn File CSV"** or drag files
4. Select one or multiple .csv files
5. Watch upload progress
6. Files appear in list automatically

### Managing Files
1. **View**: See all uploaded files with details
2. **Download**: Click download icon to open/save
3. **Delete**: Click trash icon, confirm deletion
4. **Re-upload**: Upload more files anytime

## File Validation

### Accepted Files
- ✅ Extension: `.csv` only
- ✅ Size: Up to 10MB per file
- ✅ Multiple: Upload many files at once

### Rejected Files
- ❌ Non-CSV files (shows error)
- ❌ Files over 10MB (shows error)
- ❌ Invalid file names (auto-sanitized)

## Storage Details

### Supabase Storage Bucket
- **Bucket name**: `financial-documents`
- **Path structure**: `csv-reports/{shopId}/{year}/{month}/`
- **File naming**: `{reportPeriodId}_{timestamp}_{sanitized_name}.csv`
- **Public access**: Yes (with URL)

### File Naming
Original: `Etsy Activity Summary - Jan 2025.csv`
Stored as: `123_1737123456789_Etsy_Activity_Summary_-_Jan_2025.csv`

## Common CSV Files from Etsy

### 1. Activity Summary
- Monthly overview of all transactions
- Sales, fees, refunds, taxes
- Most important report

### 2. Payment Reports
- Detailed payment information
- Deposits, withdrawals, holds
- Bank transfer details

### 3. Order Details
- Individual order information
- Customer details, shipping
- Item-level breakdown

### 4. Transaction History
- All financial transactions
- Chronological order
- Includes all fees

## Technical Implementation

### Upload Process
1. User selects files
2. Validate file type and size
3. Generate unique filename
4. Upload to Supabase Storage
5. Get public URL
6. Add to files array
7. Trigger onChange callback

### Delete Process
1. User clicks delete
2. Show confirmation dialog
3. Extract file path from URL
4. Delete from Supabase Storage
5. Remove from files array
6. Trigger onChange callback

### Error Handling
- File type validation
- File size validation
- Upload errors (network, storage)
- Delete errors
- User-friendly error messages

## State Management

### Current Implementation
Files are stored in component state and passed via props. For persistence:

**Option 1: JSON in notes field** (current)
```typescript
// Store in report.notes as JSON
const notesData = {
  csvFiles: [...files],
  otherData: {}
};
```

**Option 2: Separate database table** (recommended)
```sql
-- Use csv_documents table
-- Run migration: add_csv_documents.sql
```

## UI/UX Features

### Upload Area
- **Dashed border**: Indicates drop zone
- **Upload icon**: Visual indicator
- **Clear instructions**: "Drag or click"
- **File type hint**: ".csv | Max 10MB"
- **Hover effect**: Border color change

### Progress Indicator
- **Animated icon**: Pulsing upload icon
- **Percentage**: Real-time progress
- **Progress bar**: Visual feedback
- **Smooth transitions**: Professional feel

### File List
- **Card layout**: Clean, organized
- **File icon**: Green CSV icon
- **File details**: Name, size, date
- **Action buttons**: Download, delete
- **Hover effects**: Interactive feedback

### Empty State
- **Icon**: Large file icon
- **Message**: "Chưa có file CSV nào"
- **Helpful**: Encourages upload

## Best Practices

### For Users
1. **Name files clearly**: Use descriptive names
2. **Upload regularly**: Don't wait until month end
3. **Verify uploads**: Check file list after upload
4. **Download backups**: Keep local copies
5. **Delete old files**: Clean up when needed

### For Developers
1. **Validate early**: Check files before upload
2. **Handle errors**: Show clear messages
3. **Progress feedback**: Keep users informed
4. **Secure storage**: Use proper permissions
5. **Clean up**: Delete orphaned files

## Future Enhancements

### Potential Features
- [ ] CSV preview/parsing in browser
- [ ] Auto-extract data from CSV
- [ ] CSV validation (check columns)
- [ ] Bulk download (zip multiple files)
- [ ] File versioning
- [ ] File categories/tags
- [ ] Search/filter files
- [ ] File size optimization
- [ ] Thumbnail previews
- [ ] Drag & drop upload (full implementation)

### Performance Optimizations
- [ ] Chunked upload for large files
- [ ] Compression before upload
- [ ] Lazy loading file list
- [ ] Caching file metadata
- [ ] Background upload queue

## Troubleshooting

### Upload Fails
- Check internet connection
- Verify file is valid CSV
- Check file size (< 10MB)
- Try different browser
- Clear browser cache

### File Not Appearing
- Refresh the page
- Check browser console
- Verify Supabase connection
- Check storage bucket permissions

### Cannot Delete File
- Check if file still exists in storage
- Verify permissions
- Try refreshing page
- Contact administrator

## Security Considerations

### File Validation
- Only CSV files accepted
- Size limits enforced
- Filename sanitization
- No executable content

### Storage Security
- Files stored in Supabase Storage
- Public URLs (consider signed URLs)
- Access control via RLS
- Regular security audits

### Data Privacy
- CSV files may contain sensitive data
- Ensure proper access controls
- Consider encryption at rest
- Implement audit logging

## Integration Checklist

- [x] Create CsvFileUpload component
- [x] Update DocumentsTab component
- [x] Remove old VAT/Credit handlers
- [x] Export new component
- [x] Update FinancialReportsPage
- [x] Create migration file
- [x] Write documentation
- [ ] Run migration (optional)
- [ ] Configure Supabase Storage bucket
- [ ] Test upload functionality
- [ ] Test delete functionality
- [ ] Test with multiple files
- [ ] Test error scenarios
- [ ] Deploy to production

## Conclusion

The CSV documents upload system provides a robust, user-friendly way for managers to upload and manage multiple CSV files from Etsy for each financial report period. The system handles validation, storage, and management with a modern, intuitive interface.

Key benefits:
- **Multiple files**: Upload many CSVs per report
- **Organized storage**: Clean folder structure
- **Easy management**: Download and delete anytime
- **User-friendly**: Clear UI with progress feedback
- **Scalable**: Ready for future enhancements
