-- Create RLS policy for testers to have full access like admins
CREATE POLICY "Testers have full access to all tools"
ON public.tool_access_tiers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'tester'
  )
);

-- Grant testers access to view all subscriptions (needed for render limits)
CREATE POLICY "Testers can view all subscriptions"
ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'tester'
  )
);