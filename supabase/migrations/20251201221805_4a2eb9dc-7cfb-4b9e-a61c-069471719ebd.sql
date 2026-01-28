-- Drop the restrictive policy and recreate as permissive
DROP POLICY IF EXISTS "Anyone can view verified swatches" ON public.vinyl_swatches;

-- Create permissive policy (default) for viewing verified swatches
CREATE POLICY "Anyone can view verified swatches" 
ON public.vinyl_swatches 
FOR SELECT 
USING (verified = true);