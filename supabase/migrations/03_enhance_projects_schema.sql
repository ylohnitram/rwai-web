-- Enhance the projects table with additional fields for improved admin workflow
ALTER TABLE public.projects 
  -- Change approved boolean to a status enum
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  -- Add fields for review information
  ADD COLUMN IF NOT EXISTS review_notes TEXT,
  ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
  -- Add field for audit document storage
  ADD COLUMN IF NOT EXISTS audit_document_path TEXT,
  -- Add field for contact email
  ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- For backwards compatibility (to not break existing code)
-- Create a trigger to keep the approved field in sync with status
CREATE OR REPLACE FUNCTION sync_approved_with_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    NEW.approved = true;
  ELSE
    NEW.approved = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_project_status_with_approved
BEFORE INSERT OR UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION sync_approved_with_status();

-- Add view for better querying of projects by status
CREATE OR REPLACE VIEW public.project_reviews AS
SELECT 
  p.*,
  prof.email as reviewer_email
FROM 
  public.projects p
LEFT JOIN 
  public.profiles prof ON p.reviewer_id = prof.id;

-- Create a notification table to track project status changes
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  project_id UUID REFERENCES public.projects(id),
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('approval', 'rejection', 'changes_requested', 'system')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can create notifications
CREATE POLICY "Admins can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create function to automatically send notification on project status change
CREATE OR REPLACE FUNCTION notify_on_project_status_change()
RETURNS TRIGGER AS $$
DECLARE
  project_name TEXT;
  user_id UUID;
  message TEXT;
  notification_type TEXT;
BEGIN
  -- Only proceed if status has changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Get project information
  SELECT name INTO project_name FROM public.projects WHERE id = NEW.id;
  
  -- Determine notification type and message
  CASE NEW.status
    WHEN 'approved' THEN
      notification_type := 'approval';
      message := 'Your project "' || project_name || '" has been approved and is now listed in the directory.';
    WHEN 'rejected' THEN
      notification_type := 'rejection';
      message := 'Your project "' || project_name || '" has been rejected. ' || COALESCE(NEW.review_notes, '');
    WHEN 'changes_requested' THEN
      notification_type := 'changes_requested';
      message := 'Changes have been requested for your project "' || project_name || '": ' || COALESCE(NEW.review_notes, '');
    ELSE
      notification_type := 'system';
      message := 'Your project "' || project_name || '" status has been updated to ' || NEW.status;
  END CASE;
  
  -- Get associated user ID from contact_email (this is simplified, your actual implementation may differ)
  -- In a real implementation, you'd need to handle this differently since the submitter might not have an account
  SELECT id INTO user_id FROM auth.users WHERE email = NEW.contact_email LIMIT 1;
  
  -- Create notification if we have a user ID
  IF user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, project_id, message, type)
    VALUES (user_id, NEW.id, message, notification_type);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_status_notification
AFTER UPDATE OF status ON public.projects
FOR EACH ROW
EXECUTE FUNCTION notify_on_project_status_change();
