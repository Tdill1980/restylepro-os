-- Create table for vehicle render images
CREATE TABLE vehicle_render_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type TEXT NOT NULL CHECK (product_type IN ('inkfusion', 'fadewraps', 'wbty', 'specialty', 'approvemode')),
  swatch_id UUID NOT NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('sedan', 'suv', 'truck', 'coupe', 'sports', 'van', 'exotic')),
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE vehicle_render_images ENABLE ROW LEVEL SECURITY;

-- Public read access for active renders
CREATE POLICY "Public read access to renders"
ON vehicle_render_images
FOR SELECT
USING (is_active = true);

-- Admin full access
CREATE POLICY "Admin full access to renders"
ON vehicle_render_images
FOR ALL
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_vehicle_renders_lookup 
ON vehicle_render_images(product_type, swatch_id, vehicle_type, is_active);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_vehicle_renders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vehicle_renders_updated_at
BEFORE UPDATE ON vehicle_render_images
FOR EACH ROW
EXECUTE FUNCTION update_vehicle_renders_updated_at();