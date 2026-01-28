-- Create storage bucket for manufacturer color chart PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('color-charts', 'color-charts', true);

-- RLS policies for color-charts bucket
CREATE POLICY "Public can view color chart PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'color-charts');

CREATE POLICY "Admins can upload color chart PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'color-charts' AND
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can update color chart PDFs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'color-charts' AND
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can delete color chart PDFs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'color-charts' AND
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);