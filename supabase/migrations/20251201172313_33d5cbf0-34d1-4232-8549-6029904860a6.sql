-- Phase 1: Self-Learning ColorPro Database Upgrade
-- Add new columns for self-learning system

ALTER TABLE vinyl_swatches ADD COLUMN IF NOT EXISTS color_type TEXT;
ALTER TABLE vinyl_swatches ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 0;
ALTER TABLE vinyl_swatches ADD COLUMN IF NOT EXISTS search_count INTEGER DEFAULT 0;
ALTER TABLE vinyl_swatches ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE vinyl_swatches ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'seeded';