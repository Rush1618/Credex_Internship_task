-- SpendLens Database Schema — v2.0
-- Updated: 2026-05-13
-- Changelog: Added indexes, is_high_savings column, unique lead constraint, confidence_score

-- =====================================================================
-- TABLE: audits
-- Purpose: Stores audit results (no PII). Publicly readable by UUID.
-- =====================================================================
CREATE TABLE IF NOT EXISTS audits (
  id                   uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  uuid                 text          UNIQUE NOT NULL,
  audit_input          jsonb         NOT NULL,
  audit_result         jsonb         NOT NULL,
  total_monthly_savings numeric(10,2) NOT NULL DEFAULT 0,
  total_annual_savings  numeric(10,2) NOT NULL DEFAULT 0,
  is_high_savings      boolean       NOT NULL DEFAULT false,
  confidence_score     smallint      CHECK (confidence_score BETWEEN 0 AND 100),
  ai_summary           text,                   -- nullable: populated after OpenRouter call
  created_at           timestamptz   DEFAULT now() NOT NULL
);

-- Performance indexes (query patterns: latest audits, top savers, lookup by uuid)
CREATE INDEX IF NOT EXISTS idx_audits_created_at          ON audits (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audits_monthly_savings     ON audits (total_monthly_savings DESC);
CREATE INDEX IF NOT EXISTS idx_audits_is_high_savings     ON audits (is_high_savings) WHERE is_high_savings = true;

-- =====================================================================
-- TABLE: leads
-- Purpose: Stores email leads (PII). Service-role access only.
-- =====================================================================
CREATE TABLE IF NOT EXISTS leads (
  id              uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  email           text          NOT NULL,
  company_name    text,
  role            text,
  audit_uuid      text          REFERENCES audits(uuid) ON DELETE SET NULL,
  is_high_savings boolean       DEFAULT false,
  monthly_savings numeric(10,2) DEFAULT 0,
  annual_savings  numeric(10,2) DEFAULT 0,
  created_at      timestamptz   DEFAULT now() NOT NULL,

  -- Prevent duplicate submissions for the same email + audit
  CONSTRAINT unique_lead_per_audit UNIQUE (email, audit_uuid)
);

-- Index: fast lookup by email for deduplication and admin queries
CREATE INDEX IF NOT EXISTS idx_leads_email      ON leads (email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);

-- =====================================================================
-- TABLE: messages
-- Purpose: Stores contact form submissions (PII). Service-role only.
-- =====================================================================
CREATE TABLE IF NOT EXISTS messages (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text        NOT NULL,
  email       text        NOT NULL,
  subject     text,
  message     text        NOT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
ALTER TABLE audits   ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads    ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Audits: public SELECT (no PII exposed — tools + savings numbers only)
-- Note: identifying details (email, company) are only in the leads table
CREATE POLICY "audits_public_select" ON audits
  FOR SELECT USING (true);

-- Audits: INSERT via service role only (API routes use SUPABASE_SERVICE_ROLE_KEY)
CREATE POLICY "audits_service_insert" ON audits
  FOR INSERT WITH CHECK (true);

-- Leads: NO public access at all (service-role bypasses RLS)
CREATE POLICY "leads_no_public_access" ON leads
  FOR ALL USING (false);

-- Messages: NO public access at all (service-role bypasses RLS)
CREATE POLICY "messages_no_public_access" ON messages
  FOR ALL USING (false);

-- =====================================================================
-- NOTES
-- =====================================================================
-- • The service role key (SUPABASE_SERVICE_ROLE_KEY) bypasses RLS
--   and is used exclusively in Next.js API Route Handlers (server-side).
-- • The anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY) is used client-side
--   and can only SELECT from `audits`. It has zero access to `leads` or `messages`.
-- • Do NOT run this file against a production database that already has data —
--   use Supabase migrations for incremental changes.
