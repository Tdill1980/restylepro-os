-- Update auto_assign_tester_role function to include Gary Guiterez from Houdini Wraps
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
    'trish@weprintwraps.com',
    'houdiniwraps@gmail.com'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'tester')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;