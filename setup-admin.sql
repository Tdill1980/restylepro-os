-- Helper script to set up admin access
-- 
-- Step 1: First create an account by logging in at /admin/login
-- Step 2: Find your user ID and email:

SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Step 3: Grant admin role (replace YOUR-USER-ID with the actual ID from step 2):

INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR-USER-ID-HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 4: Verify admin role was assigned:

SELECT 
  u.email,
  ur.role
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin';
