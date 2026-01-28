-- Create table for render quality ratings
CREATE TABLE public.render_quality_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  render_id UUID NOT NULL,
  render_type TEXT NOT NULL CHECK (render_type IN ('designpanelpro', 'inkfusion', 'wbty', 'fadewraps')),
  user_email TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.render_quality_ratings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit ratings
CREATE POLICY "Anyone can submit quality ratings"
  ON public.render_quality_ratings
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to view ratings
CREATE POLICY "Anyone can view quality ratings"
  ON public.render_quality_ratings
  FOR SELECT
  USING (true);

-- Only admins can update/delete ratings
CREATE POLICY "Admins can manage ratings"
  ON public.render_quality_ratings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX idx_render_quality_ratings_flagged ON public.render_quality_ratings(is_flagged) WHERE is_flagged = true;
CREATE INDEX idx_render_quality_ratings_render ON public.render_quality_ratings(render_id, render_type);

-- Add trigger for updated_at
CREATE TRIGGER update_render_quality_ratings_updated_at
  BEFORE UPDATE ON public.render_quality_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();