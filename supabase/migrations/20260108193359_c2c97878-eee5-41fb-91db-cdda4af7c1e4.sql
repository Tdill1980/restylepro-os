-- Create quote_events table for conversion tracking telemetry
CREATE TABLE public.quote_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id TEXT,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'frontend',
  product_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.quote_events ENABLE ROW LEVEL SECURITY;

-- Service role can insert (edge functions)
CREATE POLICY "Service role can insert events"
  ON public.quote_events FOR INSERT
  WITH CHECK (true);

-- Admins can read events by checking user_roles directly
CREATE POLICY "Admins can read events"
  ON public.quote_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'::public.app_role
    )
  );

-- Indexes for funnel queries
CREATE INDEX idx_quote_events_type_created ON public.quote_events(event_type, created_at DESC);
CREATE INDEX idx_quote_events_quote_id ON public.quote_events(quote_id);
CREATE INDEX idx_quote_events_product_type ON public.quote_events(product_type);