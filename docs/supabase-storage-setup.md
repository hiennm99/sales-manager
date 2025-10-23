# Supabase Storage Setup Guide

## Problem
Getting **400 Bad Request** errors when uploading files because Supabase Storage policies are not configured.

## Solution
Run the storage policies migration to allow uploads, downloads, and deletes.

## Step-by-Step Setup

### 1. Open Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)

### 2. Run the Migration
1. Click **"New Query"**
2. Copy the entire content from:
   ```
   migrations/supabase_storage_policies_financial_documents.sql
   ```
3. Paste into the SQL Editor
4. Click **"Run"** or press `Ctrl+Enter`

### 3. Verify Bucket Created
1. Go to **Storage** (left sidebar)
2. You should see **"financial-documents"** bucket
3. It should be marked as **Public**

### 4. Verify Policies Created
Run this query in SQL Editor:
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%financial-documents%';
```

You should see 4 policies:
- ✅ Allow upload to financial-documents subfolders (INSERT)
- ✅ Allow read access to financial-documents (SELECT)
- ✅ Allow delete from financial-documents (DELETE)
- ✅ Allow update to financial-documents (UPDATE)

### 5. Test Upload
1. Go to your application
2. Navigate to Financial Reports
3. Create or open a report
4. Try uploading a CSV file or overview image
5. Should work without 400 errors!

## What the Policies Do

### INSERT Policy (Upload)
- Allows uploading files to specific subfolders
- Permitted folders:
  - `overview/` - Overview images
  - `csv-reports/` - CSV files
  - `money-on-etsy/` - Money on Etsy images
  - `incoming-money/` - Incoming money images
  - `received-money/` - Received money images
  - `expenses/` - Expense images
  - `transferred-money/` - Transferred money images
  - `vat-statements/` - VAT statements
  - `credit-notes/` - Credit notes

### SELECT Policy (Read/Download)
- Allows anyone to read/download files
- Bucket is public, so files are accessible via URL

### DELETE Policy
- Allows deleting files from permitted folders
- Same folder restrictions as INSERT

### UPDATE Policy
- Allows updating file metadata
- Applies to entire bucket

## Folder Structure

Files are organized like this:
```
financial-documents/
├── overview/
│   └── {shop_id}/
│       └── {year}/
│           └── {month}/
│               └── {report_id}_{timestamp}_{filename}
├── csv-reports/
│   └── {shop_id}/
│       └── {year}/
│           └── {month}/
│               └── {report_id}_{timestamp}_{filename}.csv
├── money-on-etsy/
│   └── {shop_id}/...
├── incoming-money/
│   └── {shop_id}/...
├── received-money/
│   └── {shop_id}/...
├── expenses/
│   └── {shop_id}/...
└── transferred-money/
    └── {shop_id}/...
```

## Security Considerations

### Current Setup (Public Access)
- ✅ Easy to implement
- ✅ Files accessible via direct URL
- ⚠️ Anyone with URL can access files
- ⚠️ No authentication required

### Recommended for Production
Add authentication check to policies:

```sql
-- Example: Require authentication
CREATE POLICY "Allow authenticated upload"
ON storage.objects 
FOR INSERT
WITH CHECK (
    bucket_id = 'financial-documents' 
    AND auth.uid() IS NOT NULL  -- Must be logged in
    AND (storage.foldername(name))[1] IN (...)
);
```

### Advanced: Employee-Based Access
```sql
-- Example: Only allow specific employees
CREATE POLICY "Allow employee upload"
ON storage.objects 
FOR INSERT
WITH CHECK (
    bucket_id = 'financial-documents' 
    AND auth.uid() IN (
        SELECT id FROM employees WHERE role IN ('manager', 'admin')
    )
);
```

## Troubleshooting

### Still Getting 400 Errors?

**Check 1: Bucket exists**
```sql
SELECT * FROM storage.buckets WHERE id = 'financial-documents';
```

**Check 2: Policies exist**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%financial-documents%';
```

**Check 3: File path is correct**
- Path must start with allowed folder name
- Example: `csv-reports/1/2025/10/file.csv` ✅
- Example: `random/file.csv` ❌

**Check 4: Bucket is public**
```sql
UPDATE storage.buckets 
SET public = true 
WHERE id = 'financial-documents';
```

### Getting 403 Forbidden?
- Policies are too restrictive
- Check if folder name is in allowed list
- Verify authentication if required

### Files Not Appearing?
- Check browser console for errors
- Verify Supabase connection
- Check if upload actually succeeded
- Look in Storage dashboard

## Testing Checklist

After setup, test these scenarios:

- [ ] Upload CSV file to csv-reports folder
- [ ] Upload overview image to overview folder
- [ ] Download a file via URL
- [ ] Delete a file
- [ ] Upload to each subfolder type
- [ ] Verify files appear in Storage dashboard
- [ ] Check file URLs are accessible
- [ ] Test with different file sizes
- [ ] Test with different file types

## Quick Fix Commands

If you need to reset everything:

```sql
-- Delete all policies
DROP POLICY IF EXISTS "Allow upload to financial-documents subfolders" ON storage.objects;
DROP POLICY IF EXISTS "Allow read access to financial-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete from financial-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow update to financial-documents" ON storage.objects;

-- Delete bucket (WARNING: Deletes all files!)
DELETE FROM storage.buckets WHERE id = 'financial-documents';

-- Then re-run the migration
```

## Support

If you're still having issues:
1. Check Supabase logs in dashboard
2. Check browser console for errors
3. Verify Supabase project URL and anon key
4. Check network tab for actual error response
5. Contact Supabase support if needed

## Summary

✅ **Run migration**: `supabase_storage_policies_financial_documents.sql`  
✅ **Verify bucket**: Check Storage dashboard  
✅ **Verify policies**: Run SELECT query  
✅ **Test upload**: Try uploading a file  
✅ **Done**: Files should upload successfully!
