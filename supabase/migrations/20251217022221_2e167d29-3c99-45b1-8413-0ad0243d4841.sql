-- Fix Admin Gallery deletions: convert RESTRICTIVE RLS delete policies to PERMISSIVE so admins/testers can delete.

-- COLOR_VISUALIZATIONS
ALTER TABLE public.color_visualizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can delete visualizations" ON public.color_visualizations;
DROP POLICY IF EXISTS "Testers can delete visualizations" ON public.color_visualizations;
CREATE POLICY "Admins and testers can delete visualizations"
ON public.color_visualizations
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'tester'::app_role)
);

-- VEHICLE_RENDERS
ALTER TABLE public.vehicle_renders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access to renders" ON public.vehicle_renders;
DROP POLICY IF EXISTS "Admins and testers can manage vehicle renders" ON public.vehicle_renders;
CREATE POLICY "Admins and testers can manage vehicle renders"
ON public.vehicle_renders
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'tester'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'tester'::app_role)
);

-- INKFUSION_CAROUSEL
ALTER TABLE public.inkfusion_carousel ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access" ON public.inkfusion_carousel;
DROP POLICY IF EXISTS "Testers can delete inkfusion carousel" ON public.inkfusion_carousel;
CREATE POLICY "Admins and testers can manage inkfusion carousel"
ON public.inkfusion_carousel
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'tester'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'tester'::app_role)
);

-- WBTY_CAROUSEL
ALTER TABLE public.wbty_carousel ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access" ON public.wbty_carousel;
DROP POLICY IF EXISTS "Testers can delete wbty carousel" ON public.wbty_carousel;
CREATE POLICY "Admins and testers can manage wbty carousel"
ON public.wbty_carousel
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'tester'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'tester'::app_role)
);

-- APPROVEMODE_CAROUSEL
ALTER TABLE public.approvemode_carousel ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access" ON public.approvemode_carousel;
DROP POLICY IF EXISTS "Testers can delete approvemode carousel" ON public.approvemode_carousel;
CREATE POLICY "Admins and testers can manage approvemode carousel"
ON public.approvemode_carousel
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'tester'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'tester'::app_role)
);

-- FADEWRAPS_CAROUSEL
ALTER TABLE public.fadewraps_carousel ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access" ON public.fadewraps_carousel;
CREATE POLICY "Admins and testers can manage fadewraps carousel"
ON public.fadewraps_carousel
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'tester'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'tester'::app_role)
);

-- DESIGNPANELPRO_CAROUSEL
ALTER TABLE public.designpanelpro_carousel ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access" ON public.designpanelpro_carousel;
CREATE POLICY "Admins and testers can manage designpanelpro carousel"
ON public.designpanelpro_carousel
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'tester'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'tester'::app_role)
);
