-- Create color_visualizations table for all 3 modes
CREATE TABLE color_visualizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Customer/Organization
  customer_email TEXT NOT NULL,
  organization_id UUID,
  subscription_tier TEXT DEFAULT 'free',
  
  -- Vehicle Details
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER NOT NULL,
  vehicle_type TEXT,
  
  -- Color Data
  color_hex TEXT NOT NULL,
  color_name TEXT NOT NULL,
  finish_type TEXT NOT NULL,
  has_metallic_flakes BOOLEAN DEFAULT false,
  
  -- Mode-Specific Fields
  infusion_color_id TEXT, -- InkFusionMode: Reference to catalog color
  custom_swatch_url TEXT, -- MaterialMode: Uploaded swatch URL
  uses_custom_design BOOLEAN DEFAULT false, -- ApprovalMode flag
  custom_design_url TEXT, -- ApprovalMode: Uploaded design URL
  design_file_name TEXT,
  
  -- Render Results
  render_urls JSONB DEFAULT '{}', -- { hero_angle: url, driver_side: url, ... }
  generation_status TEXT DEFAULT 'processing'
);

-- Create indexes
CREATE INDEX idx_visualizations_org ON color_visualizations(organization_id);
CREATE INDEX idx_visualizations_email ON color_visualizations(customer_email);
CREATE INDEX idx_visualizations_status ON color_visualizations(generation_status);

-- Enable RLS
ALTER TABLE color_visualizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view all visualizations"
  ON color_visualizations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create visualizations"
  ON color_visualizations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update visualizations"
  ON color_visualizations FOR UPDATE
  USING (true);

-- Create update trigger
CREATE OR REPLACE FUNCTION update_color_visualizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_color_visualizations_updated_at
  BEFORE UPDATE ON color_visualizations
  FOR EACH ROW
  EXECUTE FUNCTION update_color_visualizations_updated_at();