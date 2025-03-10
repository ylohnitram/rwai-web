-- supabase/migrations/07_create_admin_notifications.sql
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('new_submission', 'updated_project')),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  read BOOLEAN DEFAULT false NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to read and update notifications
CREATE POLICY "Admins can read all notifications"
  ON public.admin_notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update notifications"
  ON public.admin_notifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create function and trigger to create notifications on project submissions
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

-- Trigger for new project submissions and updates
CREATE TRIGGER project_notification_trigger
AFTER INSERT OR UPDATE OF status ON public.projects
FOR EACH ROW
EXECUTE FUNCTION create_project_notification();
