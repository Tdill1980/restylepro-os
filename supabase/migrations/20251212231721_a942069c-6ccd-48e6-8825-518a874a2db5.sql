-- Add RLS policy for service role to insert/manage reference images
CREATE POLICY "Service role can manage all reference images"
ON public.vinyl_reference_images
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');