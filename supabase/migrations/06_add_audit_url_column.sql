-- Add the missing auditUrl column to the projects table
ALTER TABLE IF EXISTS public.projects 
ADD COLUMN IF NOT EXISTS audit_url TEXT;

-- Backfill auditUrl data based on existing audit_document_path
UPDATE public.projects
SET audit_url = CONCAT('/audits/', REPLACE(LOWER(name), ' ', '-'), '.pdf')
WHERE audit_url IS NULL;

-- Make sure the cache is refreshed
COMMENT ON TABLE public.projects IS 'Table containing submitted RWA projects';
