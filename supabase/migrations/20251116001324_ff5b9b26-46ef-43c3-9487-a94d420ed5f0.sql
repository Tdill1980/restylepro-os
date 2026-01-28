-- Create storage bucket for 3D vehicle renders
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-renders',
  'vehicle-renders',
  true,
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp']
);

-- Allow public read access to renders
CREATE POLICY "Public read access to vehicle renders"
ON storage.objects
FOR SELECT
USING (bucket_id = 'vehicle-renders');

-- Allow authenticated users to upload renders
CREATE POLICY "Authenticated users can upload renders"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'vehicle-renders' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their renders
CREATE POLICY "Authenticated users can update renders"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'vehicle-renders' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete renders
CREATE POLICY "Authenticated users can delete renders"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'vehicle-renders' 
  AND auth.role() = 'authenticated'
);