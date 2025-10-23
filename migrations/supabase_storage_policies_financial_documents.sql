-- Supabase Storage Policies for financial-documents bucket
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. CREATE BUCKET (if not exists)
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('financial-documents', 'financial-documents', true)
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- 2. DROP EXISTING POLICIES (if any)
-- ============================================
DROP POLICY IF EXISTS "Allow upload to financial-documents subfolders" ON storage.objects;
DROP POLICY IF EXISTS "Allow read access to financial-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete from financial-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow update to financial-documents" ON storage.objects;


-- ============================================
-- 3. CREATE POLICIES
-- ============================================

-- Policy 1: Allow INSERT (Upload)
CREATE POLICY "Allow upload to financial-documents subfolders"
ON storage.objects 
FOR INSERT
WITH CHECK (
    bucket_id = 'financial-documents' 
    AND (storage.foldername(name))[1] IN (
        'overview',
        'money-on-etsy',
        'incoming-money',
        'received-money',
        'expenses',
        'transferred-money',
        'csv-reports',
        'vat-statements',
        'credit-notes'
    )
);

-- Policy 2: Allow SELECT (Read/Download)
CREATE POLICY "Allow read access to financial-documents"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'financial-documents'
);

-- Policy 3: Allow DELETE
CREATE POLICY "Allow delete from financial-documents"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'financial-documents'
    AND (storage.foldername(name))[1] IN (
        'overview',
        'money-on-etsy',
        'incoming-money',
        'received-money',
        'expenses',
        'transferred-money',
        'csv-reports',
        'vat-statements',
        'credit-notes'
    )
);

-- Policy 4: Allow UPDATE
CREATE POLICY "Allow update to financial-documents"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'financial-documents'
)
WITH CHECK (
    bucket_id = 'financial-documents'
);


-- ============================================
-- 4. VERIFY POLICIES
-- ============================================
-- Run this to check if policies are created:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%financial-documents%';


-- ============================================
-- 5. TEST UPLOAD (Optional)
-- ============================================
-- After running this, test upload from the application
-- Check Supabase Storage dashboard to verify files appear


-- ============================================
-- NOTES:
-- ============================================
-- 1. This allows PUBLIC access (no authentication required)
-- 2. If you need authentication, add: auth.uid() IS NOT NULL
-- 3. Folder structure:
--    - overview/{shop_id}/{year}/{month}/
--    - csv-reports/{shop_id}/{year}/{month}/
--    - money-on-etsy/{shop_id}/{year}/{month}/
--    - etc.
-- 4. The bucket is set to PUBLIC (files accessible via URL)
-- 5. For production, consider adding employee-based access control
