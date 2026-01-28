-- Update the mode_type check constraint to include fadewraps
ALTER TABLE vehicle_renders DROP CONSTRAINT IF EXISTS vehicle_renders_mode_type_check;

ALTER TABLE vehicle_renders ADD CONSTRAINT vehicle_renders_mode_type_check 
  CHECK (mode_type IN ('inkfusion', 'material', 'approval', 'wbty', 'fadewraps'));