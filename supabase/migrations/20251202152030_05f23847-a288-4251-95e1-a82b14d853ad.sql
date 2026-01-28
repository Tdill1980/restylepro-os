-- Fix can_generate_render function to avoid auth.users access and add tester role check
CREATE OR REPLACE FUNCTION public.can_generate_render(user_email text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  subscription_record RECORD;
  usage_count INTEGER;
  tier_limit INTEGER;
  is_privileged BOOLEAN := false;
  found_user_id UUID;
BEGIN
  -- Get subscription record (includes user_id)
  SELECT * INTO subscription_record
  FROM public.user_subscriptions
  WHERE email = user_email
    AND status = 'active'
    AND billing_cycle_end > NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  -- If we have a subscription with user_id, check for admin/tester role
  IF subscription_record IS NOT NULL AND subscription_record.user_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 
      FROM public.user_roles 
      WHERE user_id = subscription_record.user_id 
      AND role IN ('admin', 'tester')
    ) INTO is_privileged;

    IF is_privileged THEN
      RETURN jsonb_build_object(
        'can_generate', true,
        'tier', 'agency',
        'limit', 999999,
        'used', 0,
        'remaining', 999999,
        'message', 'Privileged Access - Unlimited Renders'
      );
    END IF;
  ELSE
    -- No subscription found, but check if user exists with admin/tester role via email lookup in subscriptions
    -- Also check user_roles for any user with this email in their subscription
    SELECT us.user_id INTO found_user_id
    FROM public.user_subscriptions us
    WHERE us.email = user_email
    ORDER BY us.created_at DESC
    LIMIT 1;

    IF found_user_id IS NOT NULL THEN
      SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_id = found_user_id 
        AND role IN ('admin', 'tester')
      ) INTO is_privileged;

      IF is_privileged THEN
        RETURN jsonb_build_object(
          'can_generate', true,
          'tier', 'agency',
          'limit', 999999,
          'used', 0,
          'remaining', 999999,
          'message', 'Privileged Access - Unlimited Renders'
        );
      END IF;
    END IF;
  END IF;

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
$function$;