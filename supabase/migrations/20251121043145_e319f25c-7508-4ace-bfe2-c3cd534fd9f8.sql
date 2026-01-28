-- Create tier access control tables
CREATE TABLE IF NOT EXISTS public.tool_access_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name text NOT NULL UNIQUE,
  required_tier text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tool_access_tiers ENABLE ROW LEVEL SECURITY;

-- Public can read tier requirements
CREATE POLICY "Anyone can view tool access tiers"
ON public.tool_access_tiers
FOR SELECT
USING (is_active = true);

-- Only admins can modify
CREATE POLICY "Admins can manage tool access tiers"
ON public.tool_access_tiers
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Insert tool access tier requirements
INSERT INTO public.tool_access_tiers (tool_name, required_tier) VALUES
  ('colorpro', 'starter'),
  ('fadewraps', 'professional'),
  ('wbty', 'professional'),
  ('designpanelpro', 'proshop'),
  ('approvemode', 'proshop')
ON CONFLICT (tool_name) DO NOTHING;

-- Add tier column to user_subscriptions if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_subscriptions' 
    AND column_name = 'tier'
  ) THEN
    ALTER TABLE public.user_subscriptions 
    ADD COLUMN tier text DEFAULT 'free';
  END IF;
END $$;