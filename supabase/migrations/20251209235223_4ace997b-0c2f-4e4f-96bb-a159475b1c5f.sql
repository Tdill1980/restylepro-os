-- Fix admin policy on vehicle_renders to properly check admin role
DROP POLICY IF EXISTS "Admin full access to renders" ON vehicle_renders;

CREATE POLICY "Admin full access to renders" 
ON vehicle_renders 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));