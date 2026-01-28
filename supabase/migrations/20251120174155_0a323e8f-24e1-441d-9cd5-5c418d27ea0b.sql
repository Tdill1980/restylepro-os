-- Add before_url column to approvemode_carousel for before/after display
ALTER TABLE public.approvemode_carousel 
ADD COLUMN before_url TEXT;

COMMENT ON COLUMN public.approvemode_carousel.before_url IS 'URL of the original 2D design before rendering';