-- Phase 1: Add indexes for faster tag searches

-- Add GIN index on color_data JSONB for fast tag searches in vehicle_renders
CREATE INDEX IF NOT EXISTS idx_vehicle_renders_color_data_tags 
ON vehicle_renders USING gin (color_data jsonb_path_ops);

-- Add index for email searches in color_visualizations (if not exists)
CREATE INDEX IF NOT EXISTS idx_color_visualizations_email 
ON color_visualizations(customer_email);

-- Add index for mode_type filtering
CREATE INDEX IF NOT EXISTS idx_color_visualizations_mode_type 
ON color_visualizations(mode_type);