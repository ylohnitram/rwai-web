-- supabase/migrations/14_add_name_uniqueness_constraint.sql
-- Add a unique constraint to the name column in projects table
ALTER TABLE public.projects 
ADD CONSTRAINT projects_name_unique UNIQUE (name);

-- Add a comment to explain the constraint
COMMENT ON CONSTRAINT projects_name_unique ON public.projects IS 'Ensures project names are unique';
