-- Add gradient_direction column to fadewraps_carousel table
ALTER TABLE public.fadewraps_carousel 
ADD COLUMN gradient_direction text;

-- Add check constraint to ensure valid gradient directions
ALTER TABLE public.fadewraps_carousel
ADD CONSTRAINT fadewraps_carousel_gradient_direction_check 
CHECK (gradient_direction IN ('front-to-back', 'back-to-front', 'top-to-bottom', 'bottom-to-top', 'diagonal-front', 'diagonal-rear'));