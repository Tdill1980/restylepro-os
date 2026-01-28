-- Fix RESTRICTIVE DELETE policies on color_visualizations
-- Currently both admin and tester delete policies are RESTRICTIVE, requiring BOTH to pass
-- Change to PERMISSIVE so that EITHER admin OR tester can delete

-- Drop existing restrictive delete policies
DROP POLICY IF EXISTS "Admins can delete visualizations" ON public.color_visualizations;
DROP POLICY IF EXISTS "Testers can delete visualizations" ON public.color_visualizations;

-- Create new PERMISSIVE delete policies (only ONE needs to pass)
CREATE POLICY "Admins can delete visualizations" 
ON public.color_visualizations 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'::app_role
  )
);

CREATE POLICY "Testers can delete visualizations" 
ON public.color_visualizations 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'tester'::app_role
  )
);