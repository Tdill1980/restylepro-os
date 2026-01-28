-- Create search cache table to avoid repeated DataForSEO calls
CREATE TABLE IF NOT EXISTS public.vinyl_swatch_search_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  swatch_id UUID REFERENCES public.vinyl_swatches(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  results_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(swatch_id, search_query)
);

-- Enable RLS
ALTER TABLE public.vinyl_swatch_search_cache ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can manage search cache"
ON public.vinyl_swatch_search_cache
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Service role access for edge functions
CREATE POLICY "Service role full access to search cache"
ON public.vinyl_swatch_search_cache
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Add index for fast lookups
CREATE INDEX idx_vinyl_swatch_search_cache_swatch_id ON public.vinyl_swatch_search_cache(swatch_id);