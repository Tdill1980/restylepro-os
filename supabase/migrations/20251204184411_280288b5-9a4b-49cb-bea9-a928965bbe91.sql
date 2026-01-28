-- Allow authenticated users to insert their own custom panels (non-curated)
CREATE POLICY "Authenticated users can insert custom panels"
ON designpanelpro_patterns
FOR INSERT
TO authenticated
WITH CHECK (is_curated = false);