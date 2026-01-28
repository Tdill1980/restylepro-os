-- Add vehicle information columns to vehicle_render_images table
ALTER TABLE vehicle_render_images 
ADD COLUMN IF NOT EXISTS vehicle_make TEXT,
ADD COLUMN IF NOT EXISTS vehicle_model TEXT,
ADD COLUMN IF NOT EXISTS vehicle_year TEXT;