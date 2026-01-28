-- Add gradient quality columns to render_quality_ratings table
ALTER TABLE public.render_quality_ratings 
ADD COLUMN IF NOT EXISTS gradient_quality_score integer,
ADD COLUMN IF NOT EXISTS has_hard_line boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_regenerated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS validation_details jsonb;

-- Add index for faster queries on fade quality issues
CREATE INDEX IF NOT EXISTS idx_render_quality_has_hard_line 
ON public.render_quality_ratings (has_hard_line) 
WHERE has_hard_line = true;

-- Add index for gradient quality score filtering
CREATE INDEX IF NOT EXISTS idx_render_quality_gradient_score 
ON public.render_quality_ratings (gradient_quality_score) 
WHERE gradient_quality_score IS NOT NULL;