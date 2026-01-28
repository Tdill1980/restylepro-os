-- Create storage bucket for InkFusion renders if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('inkfusion-renders', 'inkfusion-renders', true)
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies for InkFusion renders bucket
CREATE POLICY "Public can view InkFusion renders"
ON storage.objects FOR SELECT
USING (bucket_id = 'inkfusion-renders');

CREATE POLICY "Admins can upload InkFusion renders"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'inkfusion-renders');

CREATE POLICY "Admins can update InkFusion renders"
ON storage.objects FOR UPDATE
USING (bucket_id = 'inkfusion-renders');

CREATE POLICY "Admins can delete InkFusion renders"
ON storage.objects FOR DELETE
USING (bucket_id = 'inkfusion-renders');