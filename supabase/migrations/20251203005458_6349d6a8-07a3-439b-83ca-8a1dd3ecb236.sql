-- Fix RLS policy on designpanelpro_patterns to be PERMISSIVE for admin deletions
DROP POLICY IF EXISTS "Admin full access" ON public.designpanelpro_patterns;

CREATE POLICY "Admin full access" 
ON public.designpanelpro_patterns 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Also ensure the query key is properly invalidated by adding a small delay
-- The actual fix is making the policy PERMISSIVE (default when not specified)