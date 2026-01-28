-- Add clean_display_url column for customer-facing panel images (without dimension text)
ALTER TABLE public.designpanelpro_patterns 
ADD COLUMN clean_display_url TEXT;