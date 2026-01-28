-- Create DesignPanelPro patterns table
CREATE TABLE designpanelpro_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ai_generated_name TEXT,
  category TEXT DEFAULT 'Curated',
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_curated BOOLEAN DEFAULT false,
  uploaded_by UUID,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE designpanelpro_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON designpanelpro_patterns
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full access" ON designpanelpro_patterns
  FOR ALL USING (true);

-- Create DesignPanelPro carousel table
CREATE TABLE designpanelpro_carousel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  media_url TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  vehicle_name TEXT,
  pattern_name TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE designpanelpro_carousel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON designpanelpro_carousel
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full access" ON designpanelpro_carousel
  FOR ALL USING (true);

-- Create DesignPanelPro videos table
CREATE TABLE designpanelpro_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  media_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE designpanelpro_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON designpanelpro_videos
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full access" ON designpanelpro_videos
  FOR ALL USING (true);

-- Update vehicle_renders mode_type constraint
ALTER TABLE vehicle_renders DROP CONSTRAINT IF EXISTS vehicle_renders_mode_type_check;
ALTER TABLE vehicle_renders ADD CONSTRAINT vehicle_renders_mode_type_check 
  CHECK (mode_type IN ('inkfusion', 'wbty', 'fadewraps', 'approvemode', 'material', 'designpanelpro'));