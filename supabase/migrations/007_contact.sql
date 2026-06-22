-- ============================================================
-- Contact Us module
-- - contact_settings: a single-row config (email + intro) for the
--   public "Contact Us" block on the About page.
-- - meeting_contacts: campus meeting points (Name, Section, Semester,
--   Department, Availability) so NTU students can find the team in person.
-- Managed from the admin portal ("Contact Us" module).
-- Migration: 007_contact.sql
-- ============================================================

-- shared trigger fn (already exists from 001; safe to re-create)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

-- 1) Singleton contact settings ------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_settings (
  id            INT PRIMARY KEY DEFAULT 1,
  contact_email TEXT,
  intro         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT contact_settings_singleton CHECK (id = 1)
);
INSERT INTO contact_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

DROP TRIGGER IF EXISTS trg_contact_settings_updated_at ON contact_settings;
CREATE TRIGGER trg_contact_settings_updated_at
  BEFORE UPDATE ON contact_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE contact_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read contact settings" ON contact_settings;
CREATE POLICY "Public read contact settings"
  ON contact_settings FOR SELECT USING (is_active = TRUE);

-- 2) Campus meeting points -----------------------------------------------------
CREATE TABLE IF NOT EXISTS meeting_contacts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  section       TEXT,
  semester      TEXT,
  department    TEXT,
  availability  TEXT,                               -- e.g. room / timings / "after 2pm, CS Lab 3"
  display_order INT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_meeting_contacts_active ON meeting_contacts(is_active, display_order);

DROP TRIGGER IF EXISTS trg_meeting_contacts_updated_at ON meeting_contacts;
CREATE TRIGGER trg_meeting_contacts_updated_at
  BEFORE UPDATE ON meeting_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE meeting_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active meeting contacts" ON meeting_contacts;
CREATE POLICY "Public read active meeting contacts"
  ON meeting_contacts FOR SELECT USING (is_active = TRUE);
