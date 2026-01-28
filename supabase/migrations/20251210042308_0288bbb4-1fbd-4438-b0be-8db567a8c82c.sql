-- Update vehicle_renders mode_type constraint to include ColorProEnhanced and GraphicsPro
DO $$
BEGIN
  -- Check if the constraint exists and drop it
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vehicle_renders_mode_type_check'
  ) THEN
    ALTER TABLE public.vehicle_renders DROP CONSTRAINT vehicle_renders_mode_type_check;
  END IF;
END $$;

-- Add updated constraint with all valid mode types
ALTER TABLE public.vehicle_renders ADD CONSTRAINT vehicle_renders_mode_type_check 
CHECK (mode_type = ANY (ARRAY[
  'inkfusion', 'colorpro', 'ColorPro', 'ColorProEnhanced', 'GraphicsPro', 'CustomStyling',
  'wbty', 'fadewraps', 'designpanelpro', 'approvemode'
]));