-- Add quality tracking columns to vehicle_renders
ALTER TABLE vehicle_renders
ADD COLUMN quality_verified BOOLEAN DEFAULT false,
ADD COLUMN reference_count INTEGER DEFAULT 0;

-- Create index for fast reference searches by manufacturer, color, finish
CREATE INDEX idx_vehicle_renders_reference_search 
ON vehicle_renders(
  ((color_data->>'manufacturer')),
  ((color_data->>'colorName')), 
  ((color_data->>'finish')),
  quality_verified,
  created_at DESC
);