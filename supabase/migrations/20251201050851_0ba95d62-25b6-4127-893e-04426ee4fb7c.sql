-- Add example_render_url column to designpanelpro_patterns for 3D preview images
ALTER TABLE designpanelpro_patterns 
ADD COLUMN example_render_url text;

COMMENT ON COLUMN designpanelpro_patterns.example_render_url IS 'URL to 3D vehicle render preview showing this panel installed on a vehicle';
