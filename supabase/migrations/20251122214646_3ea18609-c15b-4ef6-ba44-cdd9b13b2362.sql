-- Add Stripe subscription fields to user_subscriptions table
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_item_extra TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS render_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS render_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index on stripe_customer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer 
ON public.user_subscriptions(stripe_customer_id);

-- Create index on stripe_subscription_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription 
ON public.user_subscriptions(stripe_subscription_id);

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view own subscription by email" ON public.user_subscriptions;

-- Create new policy
CREATE POLICY "Users can view own subscription by email"
ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (email = (auth.jwt() ->> 'email'::text));