-- supabase/migrations/07_create_admin_notifications_fix.sql

-- Create admin_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('new_submission', 'updated_project')),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  read BOOLEAN DEFAULT false NOT NULL
);

-- Set up Row Level Security (RLS) if not already enabled
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Drop the policy if it exists, then recreate it
DROP POLICY IF EXISTS "Admins can read all notifications" ON public.admin_notifications;
CREATE POLICY "Admins can read all notifications"
  ON public.admin_notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Drop the policy if it exists, then recreate it
DROP POLICY IF EXISTS "Admins can update notifications" ON public.admin_notifications;
CREATE POLICY "Admins can update notifications"
  ON public.admin_notifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create or replace function for notifications
CREATE OR REPLACE FUNCTION create_project_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- New project submission
    INSERT INTO public.admin_notifications (type, project_id, project_name)
    VALUES ('new_submission', NEW.id, NEW.name);
  ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'changes_requested' AND NEW.status = 'pending') THEN
    -- Project updated in response to change request
    INSERT INTO public.admin_notifications (type, project_id, project_name)
    VALUES ('updated_project', NEW.id, NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists, then recreate it
DROP TRIGGER IF EXISTS project_notification_trigger ON public.projects;
CREATE TRIGGER project_notification_trigger
AFTER INSERT OR UPDATE OF status ON public.projects
FOR EACH ROW
EXECUTE FUNCTION create_project_notification();

-- Create admin_activities table if it doesn't exist
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

-- Set up Row Level Security (RLS) if not already enabled
ALTER TABLE public.admin_activities ENABLE ROW LEVEL SECURITY;

-- Drop the policy if it exists, then recreate it
DROP POLICY IF EXISTS "Admins can read all activities" ON public.admin_activities;
CREATE POLICY "Admins can read all activities"
  ON public.admin_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create or replace function for admin action logging
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

-- Drop trigger if it exists, then recreate it
DROP TRIGGER IF EXISTS set_admin_email ON public.admin_activities;
CREATE TRIGGER set_admin_email
BEFORE INSERT ON public.admin_activities
FOR EACH ROW
EXECUTE FUNCTION log_admin_action();
