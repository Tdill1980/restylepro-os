-- Create shop_profiles table for shop branding on customer proofs
CREATE TABLE public.shop_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  shop_name TEXT,
  shop_logo_url TEXT,
  phone TEXT,
  website TEXT,
  default_include_disclaimer BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shop_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own shop profile"
ON public.shop_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shop profile"
ON public.shop_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shop profile"
ON public.shop_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all shop profiles"
ON public.shop_profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_shop_profiles_updated_at
BEFORE UPDATE ON public.shop_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();