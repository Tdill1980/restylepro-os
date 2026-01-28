-- Create design revision history table
CREATE TABLE IF NOT EXISTS public.design_revision_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool TEXT NOT NULL,
  design_id UUID,
  view_type TEXT,
  original_url TEXT,
  revised_url TEXT,
  revision_prompt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX idx_revision_history_user_id ON public.design_revision_history(user_id);
CREATE INDEX idx_revision_history_design_id ON public.design_revision_history(design_id);
CREATE INDEX idx_revision_history_tool ON public.design_revision_history(tool);

-- Enable RLS
ALTER TABLE public.design_revision_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own revision history
CREATE POLICY "Users can view their own revision history"
ON public.design_revision_history
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create revision history entries
CREATE POLICY "Users can create revision history"
ON public.design_revision_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all revision history
CREATE POLICY "Admins can manage all revision history"
ON public.design_revision_history
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));