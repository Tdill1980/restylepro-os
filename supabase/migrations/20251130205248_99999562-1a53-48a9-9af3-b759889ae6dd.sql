-- Add 360° spin tracking columns to color_visualizations table
ALTER TABLE color_visualizations 
ADD COLUMN IF NOT EXISTS has_360_spin BOOLEAN DEFAULT FALSE;

ALTER TABLE color_visualizations 
ADD COLUMN IF NOT EXISTS spin_view_count INTEGER DEFAULT 0;

-- Create index for efficient filtering by 360° status
CREATE INDEX IF NOT EXISTS idx_color_visualizations_has_360_spin 
ON color_visualizations(has_360_spin);