-- Enable deletion for authenticated users on carousel tables
DROP POLICY IF EXISTS "Allow authenticated users to delete inkfusion_carousel" ON public.inkfusion_carousel;
CREATE POLICY "Allow authenticated users to delete inkfusion_carousel"
ON public.inkfusion_carousel
FOR DELETE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete wbty_carousel" ON public.wbty_carousel;
CREATE POLICY "Allow authenticated users to delete wbty_carousel"
ON public.wbty_carousel
FOR DELETE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete approvemode_carousel" ON public.approvemode_carousel;
CREATE POLICY "Allow authenticated users to delete approvemode_carousel"
ON public.approvemode_carousel
FOR DELETE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete fadewraps_carousel" ON public.fadewraps_carousel;
CREATE POLICY "Allow authenticated users to delete fadewraps_carousel"
ON public.fadewraps_carousel
FOR DELETE
TO authenticated
USING (true);