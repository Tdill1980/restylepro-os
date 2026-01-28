-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view verified swatches" ON public.vinyl_swatches;

-- Create a PERMISSIVE policy for public read access
CREATE POLICY "Anyone can view verified swatches" 
ON public.vinyl_swatches 
AS PERMISSIVE
FOR SELECT 
TO public
USING (verified = true);