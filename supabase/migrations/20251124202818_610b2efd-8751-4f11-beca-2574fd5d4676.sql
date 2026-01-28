-- Create vinyl_swatches table for WPW Vinyl Intelligence Engine
CREATE TABLE public.vinyl_swatches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer text NOT NULL,
  series text,
  name text NOT NULL,
  code text,
  finish text NOT NULL,
  material_type text,
  hex text NOT NULL,
  metallic boolean DEFAULT false,
  flake_level text,
  pearl boolean DEFAULT false,
  chrome boolean DEFAULT false,
  ppf boolean DEFAULT false,
  media_url text,
  media_type text,
  ai_confidence numeric,
  verified boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vinyl_swatches ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view verified swatches"
  ON public.vinyl_swatches FOR SELECT
  USING (verified = true);

CREATE POLICY "Authenticated users can insert swatches"
  ON public.vinyl_swatches FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own swatches"
  ON public.vinyl_swatches FOR UPDATE
  USING (created_by = auth.uid());

-- Indexes for performance
CREATE INDEX idx_vinyl_swatches_manufacturer ON public.vinyl_swatches(manufacturer);
CREATE INDEX idx_vinyl_swatches_verified ON public.vinyl_swatches(verified);
CREATE INDEX idx_vinyl_swatches_finish ON public.vinyl_swatches(finish);

-- Trigger for updated_at
CREATE TRIGGER update_vinyl_swatches_updated_at
  BEFORE UPDATE ON public.vinyl_swatches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();