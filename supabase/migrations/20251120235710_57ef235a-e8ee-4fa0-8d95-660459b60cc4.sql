-- Create user subscriptions table to track tiers and billing
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('starter', 'professional', 'business')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  billing_cycle_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  billing_cycle_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create render usage tracking table
CREATE TABLE public.render_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  tier TEXT NOT NULL,
  render_type TEXT NOT NULL,
  billing_cycle_start TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.render_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id OR email = auth.jwt()->>'email');

CREATE POLICY "Admins can manage all subscriptions"
  ON public.user_subscriptions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for render_usage
CREATE POLICY "Users can view their own render usage"
  ON public.render_usage
  FOR SELECT
  USING (auth.uid() = user_id OR email = auth.jwt()->>'email');

CREATE POLICY "Anyone can insert render usage"
  ON public.render_usage
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all render usage"
  ON public.render_usage
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_email ON public.user_subscriptions(email);
CREATE INDEX idx_render_usage_user_id ON public.render_usage(user_id);
CREATE INDEX idx_render_usage_email ON public.render_usage(email);
CREATE INDEX idx_render_usage_billing_cycle ON public.render_usage(billing_cycle_start);

-- Function to get tier limits
CREATE OR REPLACE FUNCTION public.get_tier_limit(tier_name TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN CASE tier_name
    WHEN 'starter' THEN 10
    WHEN 'professional' THEN 50
    WHEN 'business' THEN 200
    ELSE 0
  END;
END;
$$;

-- Function to check if user can generate renders
CREATE OR REPLACE FUNCTION public.can_generate_render(user_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  subscription_record RECORD;
  usage_count INTEGER;
  tier_limit INTEGER;
BEGIN
  -- Get active subscription
  SELECT * INTO subscription_record
  FROM public.user_subscriptions
  WHERE email = user_email
    AND status = 'active'
    AND billing_cycle_end > NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no subscription, return free tier limits (0)
  IF subscription_record IS NULL THEN
    RETURN jsonb_build_object(
      'can_generate', false,
      'tier', 'none',
      'limit', 0,
      'used', 0,
      'remaining', 0,
      'message', 'No active subscription. Please subscribe to generate renders.'
    );
  END IF;

  -- Get tier limit
  tier_limit := public.get_tier_limit(subscription_record.tier);

  -- Count renders in current billing cycle
  SELECT COUNT(*) INTO usage_count
  FROM public.render_usage
  WHERE email = user_email
    AND billing_cycle_start = subscription_record.billing_cycle_start;

  -- Check if can generate
  IF usage_count >= tier_limit THEN
    RETURN jsonb_build_object(
      'can_generate', false,
      'tier', subscription_record.tier,
      'limit', tier_limit,
      'used', usage_count,
      'remaining', 0,
      'message', 'Monthly render limit reached. Upgrade your plan or wait for next billing cycle.'
    );
  ELSE
    RETURN jsonb_build_object(
      'can_generate', true,
      'tier', subscription_record.tier,
      'limit', tier_limit,
      'used', usage_count,
      'remaining', tier_limit - usage_count,
      'message', 'OK'
    );
  END IF;
END;
$$;