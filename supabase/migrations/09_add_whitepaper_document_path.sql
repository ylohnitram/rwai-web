-- supabase/migrations/09_add_whitepaper_document_path.sql
-- Add whitepaper document path column to projects table
ALTER TABLE IF EXISTS public.projects 
ADD COLUMN IF NOT EXISTS whitepaper_document_path TEXT;

-- Comment on the new column to describe its purpose
COMMENT ON COLUMN public.projects.whitepaper_document_path IS 'Path to project whitepaper document in storage';
