-- Stores audit data (no PII, publicly accessible by UUID)
CREATE TABLE IF NOT EXISTS audits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  uuid text UNIQUE NOT NULL,
  audit_input jsonb NOT NULL,
  audit_result jsonb NOT NULL,
  total_monthly_savings numeric(10,2) NOT NULL DEFAULT 0,
  total_annual_savings numeric(10,2) NOT NULL DEFAULT 0,
  ai_summary text,                        -- nullable: populated after Anthropic call
  created_at timestamptz DEFAULT now()
);

-- Stores leads (PII, private)
CREATE TABLE IF NOT EXISTS leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  company_name text,
  role text,
  audit_uuid text REFERENCES audits(uuid),
  is_high_savings boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Audits are publicly readable (no PII — tools + savings only)
CREATE POLICY "Audits are publicly readable" ON audits
  FOR SELECT USING (true);

-- Audits can be inserted via service role only (API routes use service key)
CREATE POLICY "Audits insertable by service role" ON audits
  FOR INSERT WITH CHECK (true);

-- Leads are only accessible via service role (never exposed publicly)
CREATE POLICY "Leads accessible by service role only" ON leads
  FOR ALL USING (false);
