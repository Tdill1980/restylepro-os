-- Create render_templates table for caching 5-star "golden" renders
CREATE TABLE public.render_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_signature TEXT NOT NULL,
  vehicle_signature TEXT NOT NULL,
  source_visualization_id UUID REFERENCES public.color_visualizations(id) ON DELETE SET NULL,
  render_urls JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_golden_template BOOLEAN DEFAULT TRUE,
  rating INTEGER DEFAULT 5,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Create unique constraint on prompt + vehicle for efficient lookups
CREATE UNIQUE INDEX idx_render_templates_signature ON public.render_templates(prompt_signature, vehicle_signature);

-- Create index for golden template lookups
CREATE INDEX idx_render_templates_golden ON public.render_templates(is_golden_template) WHERE is_golden_template = TRUE;

-- Enable RLS
ALTER TABLE public.render_templates ENABLE ROW LEVEL SECURITY;

-- Public can read golden templates (for cache hits)
CREATE POLICY "Anyone can view golden templates"
ON public.render_templates
FOR SELECT
USING (is_golden_template = TRUE);

-- Authenticated users can create templates (when rating 5 stars)
CREATE POLICY "Authenticated users can create templates"
ON public.render_templates
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Admins can manage all templates
CREATE POLICY "Admins can manage all templates"
ON public.render_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_render_templates_updated_at
BEFORE UPDATE ON public.render_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the Tesla Model X golden template with the user's perfect renders
INSERT INTO public.render_templates (
  prompt_signature,
  vehicle_signature,
  render_urls,
  is_golden_template,
  rating,
  created_by
) VALUES (
  'two tone gold chrome top satin black bottom',
  '2022 Tesla Model X',
  '{
    "side": "https://abgevylqeazbydrtovzp.supabase.co/storage/v1/object/public/renders/golden-templates/tesla-model-x-two-tone-side.png",
    "rear": "https://abgevylqeazbydrtovzp.supabase.co/storage/v1/object/public/renders/golden-templates/tesla-model-x-two-tone-rear.png",
    "top": "https://abgevylqeazbydrtovzp.supabase.co/storage/v1/object/public/renders/golden-templates/tesla-model-x-two-tone-top.png"
  }'::jsonb,
  TRUE,
  5,
  'system@restylepro.com'
);