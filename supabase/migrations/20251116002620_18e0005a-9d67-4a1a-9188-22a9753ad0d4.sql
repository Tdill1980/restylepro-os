-- Fix function search path security warning by recreating with proper search_path
DROP TRIGGER IF EXISTS trigger_update_vehicle_renders_updated_at ON vehicle_render_images;
DROP FUNCTION IF EXISTS update_vehicle_renders_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_vehicle_renders_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_vehicle_renders_updated_at
BEFORE UPDATE ON vehicle_render_images
FOR EACH ROW
EXECUTE FUNCTION update_vehicle_renders_updated_at();