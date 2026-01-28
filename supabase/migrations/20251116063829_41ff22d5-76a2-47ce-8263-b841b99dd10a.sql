-- Create storage bucket for wrap files (renders, uploads, swatches)
INSERT INTO storage.buckets (id, name, public)
VALUES ('wrap-files', 'wrap-files', true);

-- Create vehicle_renders table to store AI-generated renders
CREATE TABLE IF NOT EXISTS public.vehicle_renders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_year TEXT NOT NULL,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  mode_type TEXT NOT NULL CHECK (mode_type IN ('inkfusion', 'material', 'approval')),
  render_url TEXT NOT NULL,
  color_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on vehicle_renders
ALTER TABLE public.vehicle_renders ENABLE ROW LEVEL SECURITY;

-- Public read access to renders
CREATE POLICY "Public read access to renders"
ON public.vehicle_renders
FOR SELECT
USING (true);

-- Admin full access to renders
CREATE POLICY "Admin full access to renders"
ON public.vehicle_renders
FOR ALL
USING (true);

-- Storage policies for wrap-files bucket
CREATE POLICY "Public read access to wrap files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'wrap-files');

CREATE POLICY "Authenticated users can upload wrap files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'wrap-files');

-- Create updated_at trigger for vehicle_renders
CREATE TRIGGER update_vehicle_renders_updated_at
BEFORE UPDATE ON public.vehicle_renders
FOR EACH ROW
EXECUTE FUNCTION public.update_vehicle_renders_updated_at();