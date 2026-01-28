-- Create moderation_log table for tracking blocked attempts
CREATE TABLE public.moderation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  blocked_term TEXT NOT NULL,
  attempted_content TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.moderation_log ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can manage moderation log"
ON public.moderation_log
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create blocked_users table for persistent bans
CREATE TABLE public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  reason TEXT,
  blocked_at TIMESTAMPTZ DEFAULT now(),
  blocked_by TEXT
);

-- Enable RLS
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can manage blocked users"
ON public.blocked_users
FOR ALL
USING (has_role(auth.uid(), 'admin'));