-- Step 1: Delete the American flag jeep render
DELETE FROM public.color_visualizations WHERE id = '0993fba9-190b-4ff8-b615-d361c5d021f7';

-- Step 2: Fix RLS policies - Drop RESTRICTIVE policies and create PERMISSIVE ones

-- designpanelpro_carousel
DROP POLICY IF EXISTS "Admin full access" ON public.designpanelpro_carousel;
CREATE POLICY "Admin full access" ON public.designpanelpro_carousel FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- fadewraps_carousel
DROP POLICY IF EXISTS "Admin full access" ON public.fadewraps_carousel;
DROP POLICY IF EXISTS "Allow authenticated users to delete fadewraps_carousel" ON public.fadewraps_carousel;
CREATE POLICY "Admin full access" ON public.fadewraps_carousel FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- inkfusion_carousel
DROP POLICY IF EXISTS "Admin full access" ON public.inkfusion_carousel;
DROP POLICY IF EXISTS "Allow authenticated users to delete inkfusion_carousel" ON public.inkfusion_carousel;
CREATE POLICY "Admin full access" ON public.inkfusion_carousel FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- wbty_carousel
DROP POLICY IF EXISTS "Admin full access" ON public.wbty_carousel;
DROP POLICY IF EXISTS "Allow authenticated users to delete wbty_carousel" ON public.wbty_carousel;
CREATE POLICY "Admin full access" ON public.wbty_carousel FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- approvemode_carousel
DROP POLICY IF EXISTS "Admin full access" ON public.approvemode_carousel;
DROP POLICY IF EXISTS "Allow authenticated users to delete approvemode_carousel" ON public.approvemode_carousel;
CREATE POLICY "Admin full access" ON public.approvemode_carousel FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- approvemode_examples
DROP POLICY IF EXISTS "Admin full access" ON public.approvemode_examples;
CREATE POLICY "Admin full access" ON public.approvemode_examples FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- approvemode_videos
DROP POLICY IF EXISTS "Admin full access" ON public.approvemode_videos;
CREATE POLICY "Admin full access" ON public.approvemode_videos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- designpanelpro_patterns
DROP POLICY IF EXISTS "Admin full access" ON public.designpanelpro_patterns;
CREATE POLICY "Admin full access" ON public.designpanelpro_patterns FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- designpanelpro_videos
DROP POLICY IF EXISTS "Admin full access" ON public.designpanelpro_videos;
CREATE POLICY "Admin full access" ON public.designpanelpro_videos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- fadewraps_patterns
DROP POLICY IF EXISTS "Admin full access" ON public.fadewraps_patterns;
CREATE POLICY "Admin full access" ON public.fadewraps_patterns FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- fadewraps_videos
DROP POLICY IF EXISTS "Admin full access" ON public.fadewraps_videos;
CREATE POLICY "Admin full access" ON public.fadewraps_videos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- inkfusion_swatches
DROP POLICY IF EXISTS "Admin full access" ON public.inkfusion_swatches;
CREATE POLICY "Admin full access" ON public.inkfusion_swatches FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- inkfusion_videos
DROP POLICY IF EXISTS "Admin full access" ON public.inkfusion_videos;
CREATE POLICY "Admin full access" ON public.inkfusion_videos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- wbty_products
DROP POLICY IF EXISTS "Admin full access" ON public.wbty_products;
CREATE POLICY "Admin full access" ON public.wbty_products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- wbty_videos
DROP POLICY IF EXISTS "Admin full access" ON public.wbty_videos;
CREATE POLICY "Admin full access" ON public.wbty_videos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- homepage_showcase
DROP POLICY IF EXISTS "Admin full access to homepage showcase" ON public.homepage_showcase;
CREATE POLICY "Admin full access" ON public.homepage_showcase FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));