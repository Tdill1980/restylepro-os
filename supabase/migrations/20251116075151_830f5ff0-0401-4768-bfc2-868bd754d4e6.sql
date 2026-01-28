-- Create roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Enhance color_visualizations for admin monitoring
ALTER TABLE color_visualizations
ADD COLUMN IF NOT EXISTS is_saved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS emailed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS mode_type TEXT;

-- Create indexes for admin dashboard performance
CREATE INDEX IF NOT EXISTS idx_visualizations_created ON color_visualizations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visualizations_mode ON color_visualizations(mode_type);
CREATE INDEX IF NOT EXISTS idx_visualizations_saved ON color_visualizations(is_saved);