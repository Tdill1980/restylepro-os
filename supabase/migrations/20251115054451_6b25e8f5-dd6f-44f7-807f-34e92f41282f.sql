-- Create storage buckets for media files
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('hero-videos', 'hero-videos', true),
  ('carousel-images', 'carousel-images', true),
  ('swatches', 'swatches', true),
  ('patterns', 'patterns', true),
  ('products', 'products', true),
  ('renders', 'renders', true),
  ('before-after', 'before-after', true)
ON CONFLICT (id) DO NOTHING;

-- Create InkFusion tables
CREATE TABLE IF NOT EXISTS inkfusion_swatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  hex TEXT,
  finish TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inkfusion_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  media_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inkfusion_carousel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  media_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create FadeWraps tables
CREATE TABLE IF NOT EXISTS fadewraps_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fadewraps_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  media_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fadewraps_carousel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  media_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create WBTY tables
CREATE TABLE IF NOT EXISTS wbty_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  price DECIMAL(10,2),
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wbty_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  media_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wbty_carousel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  media_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ApproveMode tables
CREATE TABLE IF NOT EXISTS approvemode_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  before_url TEXT NOT NULL,
  after_url TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approvemode_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  media_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approvemode_carousel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  media_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables (public access for now)
ALTER TABLE inkfusion_swatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE inkfusion_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inkfusion_carousel ENABLE ROW LEVEL SECURITY;
ALTER TABLE fadewraps_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE fadewraps_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fadewraps_carousel ENABLE ROW LEVEL SECURITY;
ALTER TABLE wbty_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE wbty_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE wbty_carousel ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvemode_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvemode_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvemode_carousel ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access" ON inkfusion_swatches FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON inkfusion_videos FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON inkfusion_carousel FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON fadewraps_patterns FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON fadewraps_videos FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON fadewraps_carousel FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON wbty_products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON wbty_videos FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON wbty_carousel FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON approvemode_examples FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON approvemode_videos FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON approvemode_carousel FOR SELECT USING (is_active = true);

-- Create policies for admin access (will add auth later)
CREATE POLICY "Admin full access" ON inkfusion_swatches FOR ALL USING (true);
CREATE POLICY "Admin full access" ON inkfusion_videos FOR ALL USING (true);
CREATE POLICY "Admin full access" ON inkfusion_carousel FOR ALL USING (true);
CREATE POLICY "Admin full access" ON fadewraps_patterns FOR ALL USING (true);
CREATE POLICY "Admin full access" ON fadewraps_videos FOR ALL USING (true);
CREATE POLICY "Admin full access" ON fadewraps_carousel FOR ALL USING (true);
CREATE POLICY "Admin full access" ON wbty_products FOR ALL USING (true);
CREATE POLICY "Admin full access" ON wbty_videos FOR ALL USING (true);
CREATE POLICY "Admin full access" ON wbty_carousel FOR ALL USING (true);
CREATE POLICY "Admin full access" ON approvemode_examples FOR ALL USING (true);
CREATE POLICY "Admin full access" ON approvemode_videos FOR ALL USING (true);
CREATE POLICY "Admin full access" ON approvemode_carousel FOR ALL USING (true);

-- Storage policies
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id IN ('hero-videos', 'carousel-images', 'swatches', 'patterns', 'products', 'renders', 'before-after'));
CREATE POLICY "Admin upload access" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('hero-videos', 'carousel-images', 'swatches', 'patterns', 'products', 'renders', 'before-after'));
CREATE POLICY "Admin update access" ON storage.objects FOR UPDATE USING (bucket_id IN ('hero-videos', 'carousel-images', 'swatches', 'patterns', 'products', 'renders', 'before-after'));
CREATE POLICY "Admin delete access" ON storage.objects FOR DELETE USING (bucket_id IN ('hero-videos', 'carousel-images', 'swatches', 'patterns', 'products', 'renders', 'before-after'));