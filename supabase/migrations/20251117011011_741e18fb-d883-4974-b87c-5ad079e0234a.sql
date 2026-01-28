-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create hero_carousel table for managing homepage carousel images
CREATE TABLE IF NOT EXISTS public.hero_carousel (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  link TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_carousel ENABLE ROW LEVEL SECURITY;

-- Public can view active slides
CREATE POLICY "Hero carousel slides are viewable by everyone"
ON public.hero_carousel
FOR SELECT
USING (is_active = true);

-- Only admins can manage carousel slides
CREATE POLICY "Admins can manage hero carousel"
ON public.hero_carousel
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Add updated_at trigger
CREATE TRIGGER update_hero_carousel_updated_at
BEFORE UPDATE ON public.hero_carousel
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();