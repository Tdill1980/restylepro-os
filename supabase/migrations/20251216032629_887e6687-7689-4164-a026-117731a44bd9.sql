-- Create authoritative manufacturer_colors table
-- This is the ONLY source of truth for verified manufacturer colors
CREATE TABLE public.manufacturer_colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manufacturer TEXT NOT NULL,
  series TEXT,
  product_code TEXT NOT NULL,
  official_name TEXT NOT NULL,
  official_hex TEXT NOT NULL,
  official_swatch_url TEXT,
  lab_l NUMERIC,
  lab_a NUMERIC,
  lab_b NUMERIC,
  finish TEXT NOT NULL DEFAULT 'Gloss',
  is_ppf BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(manufacturer, product_code)
);

-- Enable RLS
ALTER TABLE public.manufacturer_colors ENABLE ROW LEVEL SECURITY;

-- Anyone can view verified colors
CREATE POLICY "Anyone can view verified manufacturer colors"
ON public.manufacturer_colors
FOR SELECT
USING (is_verified = true);

-- Admins can manage all colors
CREATE POLICY "Admins can manage manufacturer colors"
ON public.manufacturer_colors
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for fast lookups
CREATE INDEX idx_manufacturer_colors_manufacturer ON public.manufacturer_colors(manufacturer);
CREATE INDEX idx_manufacturer_colors_product_code ON public.manufacturer_colors(product_code);

-- Update timestamp trigger
CREATE TRIGGER update_manufacturer_colors_updated_at
BEFORE UPDATE ON public.manufacturer_colors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();