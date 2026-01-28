-- Add 'wbty' to the allowed mode_type values for vehicle_renders table
ALTER TABLE vehicle_renders DROP CONSTRAINT IF EXISTS vehicle_renders_mode_type_check;

ALTER TABLE vehicle_renders 
ADD CONSTRAINT vehicle_renders_mode_type_check 
CHECK (mode_type IN ('inkfusion', 'material', 'approval', 'fadewrap', 'wbty'));