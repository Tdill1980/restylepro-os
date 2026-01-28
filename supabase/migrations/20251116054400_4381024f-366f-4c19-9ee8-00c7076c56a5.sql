-- Add title and subtitle fields to all carousel tables for text overlay editing
ALTER TABLE inkfusion_carousel 
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS subtitle TEXT;

ALTER TABLE fadewraps_carousel 
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS subtitle TEXT;

ALTER TABLE wbty_carousel 
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS subtitle TEXT;

ALTER TABLE approvemode_carousel 
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS subtitle TEXT;

-- Set default values using existing name field for backward compatibility
UPDATE inkfusion_carousel SET title = name WHERE title IS NULL;
UPDATE fadewraps_carousel SET title = name WHERE title IS NULL;
UPDATE wbty_carousel SET title = name WHERE title IS NULL;
UPDATE approvemode_carousel SET title = name WHERE title IS NULL;