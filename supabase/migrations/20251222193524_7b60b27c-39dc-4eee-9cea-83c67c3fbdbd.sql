-- Update auto-assign function to make Brice an admin
CREATE OR REPLACE FUNCTION public.auto_assign_tester_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Special case: Brice gets admin role
  IF LOWER(NEW.email) = LOWER('Brice@WePrintWraps.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
    RETURN NEW;
  END IF;

  -- Testers list
  IF LOWER(NEW.email) IN (
    LOWER('vinylvixenwraps@gmail.com'),
    LOWER('raheemroyall4@icloud.com'),
    LOWER('nick.wrap88@gmail.com'),
    LOWER('shaun@ghost-ind.com'),
    LOWER('Jackson@WePrintWraps.com'),
    LOWER('amandakinz1111@gmail.com'),
    LOWER('Royaltywrapsoc@gmail.com'),
    LOWER('info@royaltywrapsoc.com'),
    LOWER('trish@weprintwraps.com'),
    LOWER('houdiniwraps@gmail.com')
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'tester')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;