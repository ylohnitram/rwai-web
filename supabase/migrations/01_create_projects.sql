-- Create the projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  blockchain TEXT NOT NULL,
  roi NUMERIC(10, 2) NOT NULL,
  description TEXT NOT NULL,
  tvl TEXT NOT NULL,
  audit_url TEXT,
  website TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for project access
CREATE POLICY "Projects are viewable by everyone"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Projects can be inserted by authenticated users"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Projects can be updated by admins"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Projects can be deleted by admins"
  ON public.projects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column on update
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample projects
INSERT INTO public.projects (name, type, blockchain, roi, description, tvl, audit_url, website, approved, featured)
VALUES
  ('Manhattan Real Estate Fund', 'Real Estate', 'Ethereum', 8.2, 'A tokenized real estate fund focused on prime Manhattan commercial properties with quarterly dividend distributions.', '$24.5M', '/audits/manhattan-fund.pdf', 'https://example.com/manhattan', true, true),
  ('Renaissance Art Collection', 'Art', 'Polygon', 9.5, 'Fractional ownership in a curated collection of Renaissance masterpieces stored in a Swiss vault with annual appraisals.', '$12.8M', '/audits/renaissance-art.pdf', 'https://example.com/renaissance', true, true),
  ('Global Commodity Index', 'Commodities', 'Solana', 7.8, 'A diversified commodity index token backed by physical gold, silver, and agricultural commodities.', '$31.2M', '/audits/commodity-index.pdf', 'https://example.com/commodities', true, true),
  ('Tokyo Residential Portfolio', 'Real Estate', 'Ethereum', 6.5, 'A collection of residential properties in Tokyo''s premium districts with monthly rental income distribution.', '$18.7M', '/audits/tokyo-residential.pdf', 'https://example.com/tokyo', true, false),
  ('Contemporary Art Fund', 'Art', 'Polygon', 11.2, 'Investment in emerging contemporary artists with strong gallery representation and auction history.', '$8.4M', '/audits/contemporary-art.pdf', 'https://example.com/contemporary', true, false),
  ('Precious Metals Basket', 'Commodities', 'Solana', 5.9, 'A basket of physically-backed precious metals including gold, silver, platinum, and palladium.', '$42.1M', '/audits/precious-metals.pdf', 'https://example.com/metals', true, false),
  ('London Commercial Properties', 'Real Estate', 'Ethereum', 7.7, 'Prime commercial real estate in London''s financial district with established tenants on long-term leases.', '$29.3M', '/audits/london-commercial.pdf', 'https://example.com/london', true, false),
  ('Impressionist Masters Collection', 'Art', 'Ethereum', 8.7, 'A collection of museum-quality impressionist paintings with insurance and secure storage.', '$15.6M', '/audits/impressionist.pdf', 'https://example.com/impressionist', true, false),
  ('Renewable Energy Fund', 'Commodities', 'Polygon', 12.4, 'Investment in renewable energy production facilities across Europe with carbon credit benefits.', '$22.9M', '/audits/renewable-energy.pdf', 'https://example.com/energy', true, false),
  ('Miami Luxury Condominiums', 'Real Estate', 'Solana', 9.8, 'A portfolio of luxury condominiums in Miami''s most desirable neighborhoods with vacation rental income.', '$16.2M', '/audits/miami-condos.pdf', 'https://example.com/miami', true, false),
  ('Premium NFT Gallery', 'Art', 'Ethereum', 15.3, 'Curated collection of blue-chip NFTs from renowned digital artists with exhibition rights.', '$5.8M', '/audits/nft-gallery.pdf', 'https://example.com/nft', true, false),
  ('Global Agricultural Fund', 'Commodities', 'Polygon', 8.9, 'Investment in productive agricultural land across multiple continents with crop diversification.', '$27.5M', '/audits/agricultural-fund.pdf', 'https://example.com/agriculture', true, false),
  ('Berlin Residential Complex', 'Real Estate', 'Ethereum', 6.8, 'Modern apartment complex in Berlin''s growing districts with strong rental demand.', '$19.4M', '/audits/berlin-apartments.pdf', 'https://example.com/berlin', false, false),
  ('Modern Sculpture Portfolio', 'Art', 'Solana', 7.6, 'Collection of important 20th century sculptures with museum loans generating additional revenue.', '$11.3M', '/audits/sculpture-collection.pdf', 'https://example.com/sculpture', false, false),
  ('Rare Earth Elements', 'Commodities', 'Ethereum', 16.7, 'Investment in strategically important rare earth elements used in electronics and renewable technology.', '$14.8M', '/audits/rare-elements.pdf', 'https://example.com/rare-earth', false, false);
