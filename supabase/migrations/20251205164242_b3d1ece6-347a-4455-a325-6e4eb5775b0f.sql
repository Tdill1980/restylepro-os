-- Add manufacturer column to all carousel tables for proper branding display
ALTER TABLE inkfusion_carousel ADD COLUMN IF NOT EXISTS manufacturer TEXT;
ALTER TABLE wbty_carousel ADD COLUMN IF NOT EXISTS manufacturer TEXT;
ALTER TABLE fadewraps_carousel ADD COLUMN IF NOT EXISTS manufacturer TEXT;
ALTER TABLE designpanelpro_carousel ADD COLUMN IF NOT EXISTS manufacturer TEXT;
ALTER TABLE approvemode_carousel ADD COLUMN IF NOT EXISTS manufacturer TEXT;