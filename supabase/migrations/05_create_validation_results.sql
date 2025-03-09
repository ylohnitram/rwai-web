CREATE TABLE IF NOT EXISTS public.validation_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  scam_check_passed BOOLEAN NOT NULL,
  scam_check_details TEXT,
  sanctions_check_passed BOOLEAN NOT NULL,
  sanctions_check_details TEXT,
  audit_check_passed BOOLEAN NOT NULL,
  audit_check_details TEXT,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  overall_passed BOOLEAN NOT NULL,
  validated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(project_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.validation_results ENABLE ROW LEVEL SECURITY;

-- Create policies for validation_results access
CREATE POLICY "Validation results are viewable by everyone"
  ON public.validation_results FOR SELECT
  USING (true);

CREATE POLICY "Admins can create or update validation results"
  ON public.validation_results FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create trigger to update updated_at column
CREATE TRIGGER update_validation_results_updated_at
BEFORE UPDATE ON public.validation_results
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
