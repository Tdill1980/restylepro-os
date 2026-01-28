-- Create email_subscribers table for freemium funnel
CREATE TABLE public.email_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'freemium_funnel',
  social_shared BOOLEAN DEFAULT false,
  renders_unlocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for email signup)
CREATE POLICY "Anyone can subscribe"
ON public.email_subscribers
FOR INSERT
WITH CHECK (true);

-- Allow users to view their own subscription
CREATE POLICY "Users can view own subscription"
ON public.email_subscribers
FOR SELECT
USING (email = (auth.jwt() ->> 'email'::text));

-- Admins can view all
CREATE POLICY "Admins can view all subscribers"
ON public.email_subscribers
FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role
));

-- Create trigger for updated_at
CREATE TRIGGER update_email_subscribers_updated_at
BEFORE UPDATE ON public.email_subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();