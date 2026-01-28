-- Add featured_hero column to color_visualizations for manual hero selection
ALTER TABLE public.color_visualizations 
ADD COLUMN IF NOT EXISTS is_featured_hero boolean DEFAULT false;

-- Create index for faster querying of featured renders
CREATE INDEX IF NOT EXISTS idx_color_visualizations_featured_hero 
ON public.color_visualizations(is_featured_hero) 
WHERE is_featured_hero = true;