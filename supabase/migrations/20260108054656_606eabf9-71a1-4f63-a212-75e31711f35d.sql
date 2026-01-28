-- Add tracking columns to manufacturer_colors for hex data provenance
ALTER TABLE manufacturer_colors 
  ADD COLUMN IF NOT EXISTS hex_source TEXT DEFAULT 'ai_guessed',
  ADD COLUMN IF NOT EXISTS hex_confidence INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS registry_version TEXT,
  ADD COLUMN IF NOT EXISTS source_file TEXT;

-- Add comment for documentation
COMMENT ON COLUMN manufacturer_colors.hex_source IS 'Source of hex value: ai_guessed, poster_extracted, manual_verified';
COMMENT ON COLUMN manufacturer_colors.hex_confidence IS 'Confidence score 0-100, where 100 = verified from official source';
COMMENT ON COLUMN manufacturer_colors.registry_version IS 'Version of the registry JSON file used for import';
COMMENT ON COLUMN manufacturer_colors.source_file IS 'Original source file (PDF) the color was extracted from';