-- Fix search path for the update function
DROP FUNCTION IF EXISTS update_color_visualizations_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_color_visualizations_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_color_visualizations_updated_at
  BEFORE UPDATE ON color_visualizations
  FOR EACH ROW
  EXECUTE FUNCTION update_color_visualizations_updated_at();