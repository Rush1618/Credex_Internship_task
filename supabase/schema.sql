-- Stores audit data (no PII, publicly accessible by UUID)
CREATE TABLE audits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  uuid text UNIQUE NOT NULL,
  audit_input jsonb NOT NULL,
  audit_result jsonb NOT NULL,
  total_monthly_savings numeric(10,2) NOT NULL DEFAULT 0,
  total_annual_savings numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Stores leads (PII, private)
CREATE TABLE leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  company_name text,
  role text,
  audit_uuid text REFERENCES audits(uuid),
  is_high_savings boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Rate limiting table (fallback if not using Upstash)
CREATE TABLE rate_limits (
  ip text PRIMARY KEY,
  count integer DEFAULT 1,
  window_start timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Audits are publicly readable (no PII)
CREATE POLICY "Audits are publicly readable" ON audits
  FOR SELECT USING (true);

-- Leads are only accessible via service role
CREATE POLICY "Leads accessible by service role only" ON leads
  FOR ALL USING (false);
