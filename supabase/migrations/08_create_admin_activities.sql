-- supabase/migrations/08_create_admin_activities.sql
CREATE TABLE IF NOT EXISTS public.admin_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT,
  status TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.admin_activities ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to read activities
CREATE POLICY "Admins can read all activities"
  ON public.admin_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
DECLARE
  admin_email TEXT;
BEGIN
  -- Get admin email (if admin_id is provided)
  IF NEW.admin_id IS NOT NULL THEN
    SELECT email INTO admin_email FROM auth.users WHERE id = NEW.admin_id;
    NEW.admin_email := admin_email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to populate admin_email when a new activity is created
CREATE TRIGGER set_admin_email
BEFORE INSERT ON public.admin_activities
FOR EACH ROW
EXECUTE FUNCTION log_admin_action();
