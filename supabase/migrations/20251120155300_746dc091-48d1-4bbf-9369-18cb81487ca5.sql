-- Create table for homepage showcase images
CREATE TABLE public.homepage_showcase (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.homepage_showcase ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Homepage showcase images are viewable by everyone" 
ON public.homepage_showcase 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admin full access to homepage showcase" 
ON public.homepage_showcase 
FOR ALL 
USING (true);

-- Insert the current hardcoded images
INSERT INTO public.homepage_showcase (name, title, image_url, alt_text, sort_order) VALUES
('stellar-blue', 'Stellar Blue', 'https://abgevylqeazbydrtovzp.supabase.co/storage/v1/object/public/wrap-files/porsche-blue.png', 'Stellar Blue Porsche 911', 1),
('supernova-coral', 'Supernova Coral', 'https://abgevylqeazbydrtovzp.supabase.co/storage/v1/object/public/wrap-files/porsche-coral.png', 'Supernova Coral Porsche 911', 2);

-- Add trigger for updated_at
CREATE TRIGGER update_homepage_showcase_updated_at
BEFORE UPDATE ON public.homepage_showcase
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();