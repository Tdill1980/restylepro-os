-- Fix search_path for get_tier_limit function
CREATE OR REPLACE FUNCTION public.get_tier_limit(tier_name TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SET search_path = public
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

-- Fix search_path for can_generate_render function
CREATE OR REPLACE FUNCTION public.can_generate_render(user_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SET search_path = public
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