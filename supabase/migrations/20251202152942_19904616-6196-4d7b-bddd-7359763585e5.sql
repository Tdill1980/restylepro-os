-- Function to auto-assign tester role for specific affiliate emails
CREATE OR REPLACE FUNCTION public.auto_assign_tester_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IN (
    'vinylvixenwraps@gmail.com',
    'raheemroyall4@icloud.com',
    'nick.wrap88@gmail.com',
    'shaun@ghost-ind.com'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'tester')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger fires when new user signs up via any method (password, magic link, etc.)
CREATE TRIGGER on_auth_user_created_assign_tester
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_tester_role();