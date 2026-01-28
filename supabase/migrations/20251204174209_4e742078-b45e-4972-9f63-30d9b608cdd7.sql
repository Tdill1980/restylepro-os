-- Create vinyl_reference_images table to store real product photos per manufacturer color
CREATE TABLE IF NOT EXISTS public.vinyl_reference_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swatch_id UUID REFERENCES public.vinyl_swatches(id) ON DELETE CASCADE,
  manufacturer TEXT NOT NULL,
  color_name TEXT NOT NULL,
  product_code TEXT,
  image_url TEXT NOT NULL,
  source_url TEXT,
  image_type TEXT DEFAULT 'vehicle_installation',
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  color_characteristics JSONB,
  search_query TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(swatch_id, image_url)
);

-- Add indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_vinyl_reference_images_swatch_id ON public.vinyl_reference_images(swatch_id);
CREATE INDEX IF NOT EXISTS idx_vinyl_reference_images_manufacturer ON public.vinyl_reference_images(manufacturer);

-- Enable RLS
ALTER TABLE public.vinyl_reference_images ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view reference images" ON public.vinyl_reference_images
  FOR SELECT USING (true);

-- Admin can manage
CREATE POLICY "Admin can manage reference images" ON public.vinyl_reference_images
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Testers can insert reference images
CREATE POLICY "Testers can insert reference images" ON public.vinyl_reference_images
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'tester'));

-- Add flags to vinyl_swatches
ALTER TABLE public.vinyl_swatches
  ADD COLUMN IF NOT EXISTS has_reference_bundle BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_flip_film BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS needs_reference_review BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS reference_image_count INTEGER DEFAULT 0;

-- Add canonical demo flag to vehicle_renders
ALTER TABLE public.vehicle_renders
  ADD COLUMN IF NOT EXISTS is_canonical_demo BOOLEAN DEFAULT FALSE;

-- Auto-detect and set is_flip_film for existing colors
UPDATE public.vinyl_swatches
SET is_flip_film = TRUE
WHERE LOWER(name) LIKE '%flip%'
   OR LOWER(name) LIKE '%chameleon%'
   OR LOWER(name) LIKE '%colorflow%'
   OR LOWER(name) LIKE '%color flow%'
   OR LOWER(name) LIKE '%iridescent%'
   OR LOWER(name) LIKE '%psychedelic%'
   OR LOWER(name) LIKE '%color shift%'
   OR LOWER(name) LIKE '%volcanic%'
   OR LOWER(name) LIKE '%flare%';