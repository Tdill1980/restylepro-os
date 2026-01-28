-- Phase 1: Extend vinyl_swatches with material profile columns
ALTER TABLE vinyl_swatches
ADD COLUMN IF NOT EXISTS lab jsonb,
ADD COLUMN IF NOT EXISTS reflectivity float,
ADD COLUMN IF NOT EXISTS metallic_flake float,
ADD COLUMN IF NOT EXISTS finish_profile jsonb,
ADD COLUMN IF NOT EXISTS material_validated boolean DEFAULT false;

-- Phase 1B: Extend vinyl_reference_images with scoring
ALTER TABLE vinyl_reference_images
ADD COLUMN IF NOT EXISTS score float;

-- Create index for faster lookups on validated swatches
CREATE INDEX IF NOT EXISTS idx_vinyl_swatches_material_validated 
ON vinyl_swatches(material_validated) WHERE material_validated = true;

-- Create index for faster reference image lookups by score
CREATE INDEX IF NOT EXISTS idx_vinyl_reference_images_score 
ON vinyl_reference_images(score DESC NULLS LAST) WHERE is_verified = true;