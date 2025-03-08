-- Fix permissions for admin actions to work properly
-- Focus on user table permissions that were causing the error

-- Grant necessary permissions to service_role
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant access to auth schema for user references
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT SELECT ON auth.users TO service_role;

-- Create policy that allows service_role to bypass RLS on projects table
DROP POLICY IF EXISTS "service_role can do all on projects" ON public.projects;

CREATE POLICY "service_role can do all on projects"
ON public.projects
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Fix any inconsistencies in projects table
UPDATE public.projects SET status = 'pending' WHERE status IS NULL OR status = '';
