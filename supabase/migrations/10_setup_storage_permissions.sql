-- supabase/migrations/10_setup_storage_permissions.sql
-- Create storage buckets if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the audit documents bucket
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('audit-documents', 'audit-documents', false, false, 10485760, '{"application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}')
ON CONFLICT (id) DO NOTHING;

-- Create the whitepaper documents bucket
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('whitepaper-documents', 'whitepaper-documents', false, false, 10485760, '{"application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}')
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload to audit-documents
CREATE POLICY "Authenticated users can upload audit documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audit-documents'
);

-- Create policy to allow authenticated users to upload to whitepaper-documents
CREATE POLICY "Authenticated users can upload whitepaper documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'whitepaper-documents'
);

-- Create policy to allow anyone to read audit documents
CREATE POLICY "Anyone can read audit documents"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'audit-documents'
);

-- Create policy to allow anyone to read whitepaper documents
CREATE POLICY "Anyone can read whitepaper documents"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'whitepaper-documents'
);

-- Create policy to allow owners to update/delete their own documents
CREATE POLICY "Users can update/delete their own audit documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'audit-documents' AND
  (auth.uid() = owner OR auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'service_role'
  ))
);

-- Create policy to allow owners to update/delete their own whitepaper documents
CREATE POLICY "Users can update/delete their own whitepaper documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'whitepaper-documents' AND
  (auth.uid() = owner OR auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'service_role'
  ))
);
