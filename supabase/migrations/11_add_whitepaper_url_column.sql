-- supabase/migrations/11_add_whitepaper_url_column.sql
-- Add whitepaper URL column to projects table
ALTER TABLE IF EXISTS public.projects 
ADD COLUMN IF NOT EXISTS whitepaper_url TEXT;

-- Comment on the new column to describe its purpose
COMMENT ON COLUMN public.projects.whitepaper_url IS 'URL to project whitepaper';
