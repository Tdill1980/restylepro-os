-- Backfill chrome material profiles for all chrome swatches
-- finish_profile is JSONB so we need proper JSON format
UPDATE vinyl_swatches 
SET 
  finish_profile = '{"type": "chrome", "highlight_softness": 0.1, "shadow_saturation_falloff": 0.05, "anisotropy": 0}'::jsonb,
  reflectivity = 0.95,
  metallic_flake = 0,
  lab = '{"L": 75, "a": 0, "b": 10}'::jsonb,
  material_validated = true
WHERE LOWER(finish) LIKE '%chrome%' 
  AND (finish_profile IS NULL OR finish_profile::text = 'null' OR finish_profile = '{}'::jsonb);