-- Update check constraint to allow correct 3M naming
ALTER TABLE inkfusion_swatches DROP CONSTRAINT IF EXISTS inkfusion_swatches_color_library_check;

ALTER TABLE inkfusion_swatches 
ADD CONSTRAINT inkfusion_swatches_color_library_check 
CHECK (color_library IN ('colorpro_premium', 'inkfusion', 'avery', 'avery_sw900', '3m', '3m_2080'));