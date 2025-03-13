-- migrations/03_create_asset_types_table.sql

-- Create a new table for asset types
CREATE TABLE IF NOT EXISTS public.asset_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial asset types
INSERT INTO public.asset_types (name, description) VALUES
('Real Estate', 'Tokenized real estate assets including commercial, residential properties and REITs'),
('Art', 'Tokenized artwork, collectibles, and digital art with physical backing'),
('Commodities', 'Tokenized commodities including precious metals, agricultural products, and energy resources'),
('Private Credit', 'Tokenized loans and credit facilities to businesses, particularly in emerging markets');

-- Ensure the projects table exists
DO $$ 
BEGIN
  -- Check if the column exists in the projects table
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'type'
  ) THEN
    -- We need to make sure all current project types are in the asset_types table
    -- First, identify any project types not yet in asset_types
    CREATE TEMP TABLE IF NOT EXISTS missing_types AS
    SELECT DISTINCT type FROM public.projects WHERE type IS NOT NULL
    EXCEPT
    SELECT name FROM public.asset_types;
    
    -- Insert any missing types
    INSERT INTO public.asset_types (name, description)
    SELECT type, 'Tokenized ' || type || ' assets' 
    FROM missing_types;
    
    -- Drop temp table
    DROP TABLE IF EXISTS missing_types;
    
    -- Adding a foreign key constraint requires a matching type
    -- Update the foreign key constraint
    -- Note: We're not immediately adding the constraint in case existing data needs cleanup
    -- You can uncomment this line when ready to enforce the constraint
    -- ALTER TABLE public.projects ADD CONSTRAINT fk_project_asset_type FOREIGN KEY (type) REFERENCES public.asset_types(name);
  END IF;
END $$;

-- Create a function to update timestamp on record update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for automatic timestamp update
CREATE TRIGGER update_asset_type_updated_at
BEFORE UPDATE ON public.asset_types
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add an index for performance on the name column
CREATE INDEX IF NOT EXISTS idx_asset_types_name ON public.asset_types(name);
