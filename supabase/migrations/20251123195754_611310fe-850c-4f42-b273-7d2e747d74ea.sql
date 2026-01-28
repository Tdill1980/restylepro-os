-- Add 'ColorPro' as a valid mode_type for InkFusion tool
ALTER TABLE vehicle_renders DROP CONSTRAINT IF EXISTS vehicle_renders_mode_type_check;

ALTER TABLE vehicle_renders ADD CONSTRAINT vehicle_renders_mode_type_check 
  CHECK (mode_type IN ('inkfusion', 'ColorPro', 'wbty', 'fadewraps', 'designpanelpro', 'approvemode'));