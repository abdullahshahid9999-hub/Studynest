-- ============================================================
-- Team / "About Us" members
-- Managed from the admin portal ("Admin Management" module),
-- shown read-only on the public site at /about.
-- Migration: 003_team_members.sql
-- ============================================================

CREATE TABLE team_members (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  role          TEXT,                                   -- e.g. 'Founder & Lead Developer'
  info          TEXT,                                   -- short bio / about
  quote         TEXT,                                   -- personal quote / tagline
  avatar_url    TEXT,                                   -- optional profile photo URL
  linkedin_url  TEXT,
  github_url    TEXT,
  links         JSONB NOT NULL DEFAULT '[]'::jsonb,     -- extra links: [{ "label": "Portfolio", "url": "https://..." }]
  display_order INT NOT NULL DEFAULT 0,                 -- lower number shows first
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_team_members_active_order ON team_members(is_active, display_order);

-- Reuse the shared updated_at trigger function from 001_initial_schema.sql
CREATE TRIGGER trg_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Public (anon) can read ONLY active members — this is what the
-- public /about page sees. Inactive members stay hidden.
CREATE POLICY "Public read active team members"
  ON team_members FOR SELECT USING (is_active = TRUE);

-- All writes (insert/update/delete) go through the service_role key
-- used by the admin portal, which bypasses RLS. No public write policy.
