-- supabase/migrations/12_ensure_storage_buckets.sql
-- Ensure the storage extension is enabled (if not already)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the buckets if they don't exist using Supabase's storage API
DO $$
DECLARE
  audit_bucket_exists boolean;
  whitepaper_bucket_exists boolean;
BEGIN
  -- Check if buckets exist
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'audit-documents'
  ) INTO audit_bucket_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'whitepaper-documents'
  ) INTO whitepaper_bucket_exists;
  
  -- Create audit-documents bucket if it doesn't exist
  IF NOT audit_bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
    VALUES (
      'audit-documents',
      'audit-documents',
      true,
      false,
      10485760, -- 10MB
      ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    );
  END IF;
  
  -- Create whitepaper-documents bucket if it doesn't exist
  IF NOT whitepaper_bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
    VALUES (
      'whitepaper-documents',
      'whitepaper-documents',
      true,
      false,
      10485760, -- 10MB
      ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    );
  END IF;
END $$;

-- Set RLS policies
-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop policies if they already exist to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Public can read documents" ON storage.objects;
DROP POLICY IF EXISTS "Owners can update/delete their documents" ON storage.objects;

-- Create policy to allow authenticated users to upload
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('audit-documents', 'whitepaper-documents')
);

-- Create policy to allow public to read
CREATE POLICY "Public can read documents"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id IN ('audit-documents', 'whitepaper-documents')
);

-- Create policy to allow owners to delete their own documents
CREATE POLICY "Owners can update/delete their documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id IN ('audit-documents', 'whitepaper-documents') AND
  (auth.uid() = owner OR auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'service_role'
  ))
);
