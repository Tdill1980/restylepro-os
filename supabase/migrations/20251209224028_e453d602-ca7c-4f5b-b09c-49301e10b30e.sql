-- Drop the restrictive INSERT policy and create a more permissive one
DROP POLICY IF EXISTS "Users can create custom styling jobs" ON public.custom_styling_jobs;

-- Allow users to insert jobs where either user_id matches OR user_email matches their email
CREATE POLICY "Users can create custom styling jobs" 
ON public.custom_styling_jobs 
FOR INSERT 
WITH CHECK (
  (auth.uid() = user_id) OR 
  (user_email = (auth.jwt() ->> 'email'::text)) OR
  (user_id IS NULL AND user_email = (auth.jwt() ->> 'email'::text))
);