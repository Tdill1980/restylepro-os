-- Proofs table for shareable customer approval links
CREATE TABLE public.proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  tool_name TEXT NOT NULL,
  manufacturer TEXT,
  film_or_design_name TEXT,
  render_urls JSONB NOT NULL DEFAULT '[]',
  pdf_url TEXT,
  vehicle_info JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'approved', 'rejected')),
  customer_name TEXT,
  customer_email TEXT,
  customer_notes TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Access tokens for public proof viewing
CREATE TABLE public.proof_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_id UUID REFERENCES public.proofs(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ,
  revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_proofs_owner ON public.proofs(owner_user_id);
CREATE INDEX idx_proof_tokens_token ON public.proof_access_tokens(token);
CREATE INDEX idx_proof_tokens_proof ON public.proof_access_tokens(proof_id);

-- Enable RLS
ALTER TABLE public.proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_access_tokens ENABLE ROW LEVEL SECURITY;

-- Owner can manage their proofs
CREATE POLICY "Users can manage their own proofs"
  ON public.proofs FOR ALL
  USING (auth.uid() = owner_user_id);

-- Token-based public read access for customers (via token validation in app code)
CREATE POLICY "Public can view proofs via token"
  ON public.proofs FOR SELECT
  USING (true);

-- Only owners can manage tokens
CREATE POLICY "Users can manage their proof tokens"
  ON public.proof_access_tokens FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.proofs
      WHERE proofs.id = proof_access_tokens.proof_id
        AND proofs.owner_user_id = auth.uid()
    )
  );

-- Public can read tokens to validate access
CREATE POLICY "Public can read tokens"
  ON public.proof_access_tokens FOR SELECT
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_proofs_updated_at
  BEFORE UPDATE ON public.proofs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();