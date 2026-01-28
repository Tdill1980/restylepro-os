-- Add DELETE policy for color_visualizations so admins can delete gallery items
CREATE POLICY "Admins can delete visualizations" 
ON public.color_visualizations 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);