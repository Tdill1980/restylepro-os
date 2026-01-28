-- Add production file URL column to designpanelpro_patterns
ALTER TABLE public.designpanelpro_patterns
ADD COLUMN production_file_url text;

-- Create design_pack_purchases table for tracking purchases and downloads
CREATE TABLE public.design_pack_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  design_id uuid NOT NULL REFERENCES public.designpanelpro_patterns(id) ON DELETE CASCADE,
  purchase_type text NOT NULL CHECK (purchase_type IN ('printed_panels', 'production_files')),
  stripe_checkout_id text NOT NULL,
  download_url text,
  download_expires_at timestamp with time zone,
  downloaded_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on design_pack_purchases
ALTER TABLE public.design_pack_purchases ENABLE ROW LEVEL SECURITY;

-- Admins can view all purchases
CREATE POLICY "Admins can view all purchases"
ON public.design_pack_purchases
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Users can view their own purchases by email
CREATE POLICY "Users can view own purchases"
ON public.design_pack_purchases
FOR SELECT
USING (email = (auth.jwt() ->> 'email'::text));

-- Anyone can insert purchases (webhook)
CREATE POLICY "Anyone can insert purchases"
ON public.design_pack_purchases
FOR INSERT
WITH CHECK (true);

-- Create production-files storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('production-files', 'production-files', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for production-files bucket: Only admins can upload
CREATE POLICY "Admins can upload production files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'production-files' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- RLS for production-files bucket: Only admins can view/list
CREATE POLICY "Admins can view production files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'production-files' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_design_pack_purchases_updated_at
BEFORE UPDATE ON public.design_pack_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();