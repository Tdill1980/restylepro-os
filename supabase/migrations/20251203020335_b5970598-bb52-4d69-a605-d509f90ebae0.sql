-- Add delete policy for testers on color_visualizations
CREATE POLICY "Testers can delete visualizations" 
ON public.color_visualizations 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'tester'::app_role
));

-- Add delete policy for testers on vehicle_renders
CREATE POLICY "Testers can delete vehicle renders" 
ON public.vehicle_renders 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'tester'::app_role
));

-- Add delete policies for testers on carousel tables
CREATE POLICY "Testers can delete inkfusion carousel" 
ON public.inkfusion_carousel 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'tester'::app_role
));

CREATE POLICY "Testers can delete wbty carousel" 
ON public.wbty_carousel 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'tester'::app_role
));

CREATE POLICY "Testers can delete approvemode carousel" 
ON public.approvemode_carousel 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'tester'::app_role
));

CREATE POLICY "Testers can delete fadewraps carousel" 
ON public.fadewraps_carousel 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'tester'::app_role
));

CREATE POLICY "Testers can delete designpanelpro carousel" 
ON public.designpanelpro_carousel 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'tester'::app_role
));