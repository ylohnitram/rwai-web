-- 1. Grant necessary permissions to the service role
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 2. Disable Row Level Security on the projects table
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;

-- 3. Disable Row Level Security on other relevant tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- 4. Enable RLS on tables again but with correct policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 5. Create policies that allow service_role to bypass RLS
CREATE POLICY "service_role can do all on projects"
ON public.projects
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 6. Allow authenticated users (admins) to modify projects
CREATE POLICY "authenticated users can modify projects"
ON public.projects
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 7. Run direct SQL to fix the status column on all projects
UPDATE public.projects SET status = 'pending' WHERE status IS NULL OR status = '';

-- 8. Verify the structure of the projects table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' AND table_schema = 'public';
