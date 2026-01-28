-- Update RLS policies for user_subscriptions
DROP POLICY IF EXISTS "Users can view own subscription by email" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON user_subscriptions;

-- User can view their own subscription (by user_id or email)
CREATE POLICY "Users can view their own subscription"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR email = (auth.jwt() ->> 'email'));

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage all subscriptions"
  ON user_subscriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );