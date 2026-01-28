-- Create custom_styling_jobs table for V1 Custom Styling Mode
-- Stores all styling requests + renders for future V2 plotter file processing
CREATE TABLE public.custom_styling_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  
  -- Vehicle details
  vehicle_year TEXT NOT NULL,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  
  -- Styling request
  styling_prompt TEXT NOT NULL,
  reference_image_url TEXT,
  
  -- AI-detected breakdown (for V2 plotter files)
  color_zones JSONB DEFAULT '[]'::jsonb,
  material_estimate JSONB DEFAULT '{}'::jsonb,
  
  -- Generated renders (multiple views)
  render_urls JSONB DEFAULT '{}'::jsonb,
  hero_render_url TEXT,
  visualization_id UUID,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending',
  generation_started_at TIMESTAMP WITH TIME ZONE,
  generation_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Future V2: Plotter file outputs
  cut_file_urls JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_styling_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own custom styling jobs"
ON public.custom_styling_jobs
FOR SELECT
USING (auth.uid() = user_id OR user_email = (auth.jwt() ->> 'email'::text));

CREATE POLICY "Users can create custom styling jobs"
ON public.custom_styling_jobs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom styling jobs"
ON public.custom_styling_jobs
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all custom styling jobs"
ON public.custom_styling_jobs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_custom_styling_jobs_updated_at
BEFORE UPDATE ON public.custom_styling_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for user lookups
CREATE INDEX idx_custom_styling_jobs_user_id ON public.custom_styling_jobs(user_id);
CREATE INDEX idx_custom_styling_jobs_user_email ON public.custom_styling_jobs(user_email);
CREATE INDEX idx_custom_styling_jobs_status ON public.custom_styling_jobs(status);