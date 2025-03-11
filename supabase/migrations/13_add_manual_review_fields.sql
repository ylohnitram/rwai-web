-- supabase/migrations/13_add_manual_review_fields.sql
-- Add manual review fields to validation_results table

-- Add columns for manual review
ALTER TABLE IF EXISTS public.validation_results
ADD COLUMN IF NOT EXISTS manually_reviewed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS scam_check_override BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS scam_check_notes TEXT,
ADD COLUMN IF NOT EXISTS sanctions_check_override BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sanctions_check_notes TEXT,
ADD COLUMN IF NOT EXISTS audit_check_override BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS audit_check_notes TEXT;

-- Add an index for faster lookups by project_id
CREATE INDEX IF NOT EXISTS validation_results_project_id_idx 
ON public.validation_results(project_id);

-- Add comments for better documentation
COMMENT ON COLUMN public.validation_results.manually_reviewed IS 'Indicates if a manual review has been performed';
COMMENT ON COLUMN public.validation_results.reviewer_id IS 'ID of the admin who performed the manual review';
COMMENT ON COLUMN public.validation_results.reviewed_at IS 'Timestamp of when the manual review was performed';
COMMENT ON COLUMN public.validation_results.scam_check_override IS 'Indicates if scam check result was manually overridden';
COMMENT ON COLUMN public.validation_results.scam_check_notes IS 'Admin notes about scam check';
COMMENT ON COLUMN public.validation_results.sanctions_check_override IS 'Indicates if sanctions check result was manually overridden';
COMMENT ON COLUMN public.validation_results.sanctions_check_notes IS 'Admin notes about sanctions check';
COMMENT ON COLUMN public.validation_results.audit_check_override IS 'Indicates if audit check result was manually overridden';
COMMENT ON COLUMN public.validation_results.audit_check_notes IS 'Admin notes about audit check';
