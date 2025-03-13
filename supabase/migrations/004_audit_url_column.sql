-- migrations/004_audit_url_column.sql

-- Check if audit_url column exists, if not add it
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'audit_url'
  ) THEN 
    ALTER TABLE projects ADD COLUMN audit_url TEXT;
  END IF;
END $$;

-- Check if whitepaper_url column exists, if not add it
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'whitepaper_url'
  ) THEN 
    ALTER TABLE projects ADD COLUMN whitepaper_url TEXT;
  END IF;
END $$;

-- Make sure that the validation_results table has the necessary columns for tracking audit verification
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables
    WHERE table_name = 'validation_results'
  ) THEN 
    CREATE TABLE validation_results (
      id SERIAL PRIMARY KEY,
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      scam_check_passed BOOLEAN NOT NULL DEFAULT false,
      scam_check_details TEXT,
      sanctions_check_passed BOOLEAN NOT NULL DEFAULT false,
      sanctions_check_details TEXT,
      audit_check_passed BOOLEAN NOT NULL DEFAULT false,
      audit_check_details TEXT,
      risk_level TEXT NOT NULL DEFAULT 'medium',
      overall_passed BOOLEAN NOT NULL DEFAULT false,
      validated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      manually_reviewed BOOLEAN NOT NULL DEFAULT false,
      reviewer_id UUID,
      reviewed_at TIMESTAMP WITH TIME ZONE,
      scam_check_override BOOLEAN NOT NULL DEFAULT false,
      scam_check_notes TEXT,
      sanctions_check_override BOOLEAN NOT NULL DEFAULT false,
      sanctions_check_notes TEXT,
      audit_check_override BOOLEAN NOT NULL DEFAULT false,
      audit_check_notes TEXT
    );
  END IF;
END $$;
