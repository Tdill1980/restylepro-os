-- Add storage policy to allow authenticated users to upload swatches to patterns bucket
CREATE POLICY "Authenticated users can upload pattern swatches" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'patterns');

-- Also allow users to read their uploaded swatches
CREATE POLICY "Authenticated users can view pattern swatches" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'patterns');