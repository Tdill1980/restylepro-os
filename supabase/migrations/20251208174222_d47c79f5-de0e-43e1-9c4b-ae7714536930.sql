-- Create panel_designs table for DesignPanelPro saved designs
CREATE TABLE IF NOT EXISTS panel_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  panel_id uuid REFERENCES designpanelpro_patterns(id) ON DELETE SET NULL,
  vector_file_url text,
  vehicle_year text,
  vehicle_make text,
  vehicle_model text,
  finish text,
  prompt_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  preview_image_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create pattern_designs table for PatternPro saved designs
CREATE TABLE IF NOT EXISTS pattern_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id uuid REFERENCES wbty_products(id) ON DELETE SET NULL,
  pattern_image_url text NOT NULL,
  pattern_name text,
  pattern_category text,
  pattern_scale numeric,
  vehicle_year text,
  vehicle_make text,
  vehicle_model text,
  finish text,
  texture_profile jsonb,
  preview_image_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create fadewrap_designs table for FadeWraps saved designs
CREATE TABLE IF NOT EXISTS fadewrap_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  pattern_id uuid REFERENCES fadewraps_patterns(id) ON DELETE SET NULL,
  fade_name text,
  fade_category text,
  vehicle_year text,
  vehicle_make text,
  vehicle_model text,
  finish text,
  gradient_settings jsonb,
  preview_image_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE panel_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fadewrap_designs ENABLE ROW LEVEL SECURITY;

-- RLS policies for panel_designs
CREATE POLICY "Users can view their own panel designs" ON panel_designs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create panel designs" ON panel_designs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own panel designs" ON panel_designs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own panel designs" ON panel_designs FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all panel designs" ON panel_designs FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for pattern_designs
CREATE POLICY "Users can view their own pattern designs" ON pattern_designs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create pattern designs" ON pattern_designs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pattern designs" ON pattern_designs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own pattern designs" ON pattern_designs FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all pattern designs" ON pattern_designs FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for fadewrap_designs
CREATE POLICY "Users can view their own fadewrap designs" ON fadewrap_designs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create fadewrap designs" ON fadewrap_designs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own fadewrap designs" ON fadewrap_designs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own fadewrap designs" ON fadewrap_designs FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all fadewrap designs" ON fadewrap_designs FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at triggers
CREATE TRIGGER update_panel_designs_updated_at BEFORE UPDATE ON panel_designs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pattern_designs_updated_at BEFORE UPDATE ON pattern_designs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fadewrap_designs_updated_at BEFORE UPDATE ON fadewrap_designs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();