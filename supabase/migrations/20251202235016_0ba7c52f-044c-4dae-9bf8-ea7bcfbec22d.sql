-- Add trish@weprintwraps.com to auto-tester list
CREATE OR REPLACE FUNCTION public.auto_assign_tester_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.email IN (
    'vinylvixenwraps@gmail.com',
    'raheemroyall4@icloud.com',
    'nick.wrap88@gmail.com',
    'shaun@ghost-ind.com',
    'Brice@WePrintWraps.com',
    'Jackson@WePrintWraps.com',
    'amandakinz1111@gmail.com',
    'Royaltywrapsoc@gmail.com',
    'info@royaltywrapsoc.com',
    'trish@weprintwraps.com'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'tester')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

-- Update RLS policy to allow unauthenticated email signups
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.email_subscribers;
CREATE POLICY "Anyone can subscribe"
ON public.email_subscribers
FOR INSERT
WITH CHECK (true);

-- Allow anyone to check if email already exists (for duplicate handling)
DROP POLICY IF EXISTS "Check email exists" ON public.email_subscribers;
CREATE POLICY "Check email exists"
ON public.email_subscribers
FOR SELECT
USING (true);