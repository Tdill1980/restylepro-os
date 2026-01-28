-- Update Jackson's existing role to admin
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE LOWER(email) = LOWER('Jackson@WePrintWraps.com')
);

-- Update auto-assign function to make both Brice and Jackson admins
CREATE OR REPLACE FUNCTION public.auto_assign_tester_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admins list
  IF LOWER(NEW.email) IN (
    LOWER('Brice@WePrintWraps.com'),
    LOWER('Jackson@WePrintWraps.com')
  ) THEN
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