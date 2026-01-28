-- Update vehicle_renders mode_type constraint to include 'approvemode'
ALTER TABLE vehicle_renders DROP CONSTRAINT IF EXISTS vehicle_renders_mode_type_check;

ALTER TABLE vehicle_renders ADD CONSTRAINT vehicle_renders_mode_type_check 
CHECK (mode_type IN ('inkfusion', 'wbty', 'fadewraps', 'designpanelpro', 'approvemode'));