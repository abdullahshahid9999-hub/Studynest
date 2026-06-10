-- ============================================================
-- NTU Past Papers Archive — Full Database Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full-text search

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE exam_type AS ENUM ('Mid', 'Final');
CREATE TYPE term_type AS ENUM ('Spring', 'Fall');
CREATE TYPE paper_status AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE semester_number AS ENUM ('1','2','3','4','5','6','7','8');

-- ============================================================
-- TABLE: departments
-- ============================================================

CREATE TABLE departments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  code        TEXT NOT NULL UNIQUE,   -- e.g. 'CS', 'TE', 'ME'
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: teachers
-- ============================================================

CREATE TABLE teachers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  name          TEXT NOT NULL,
  designation   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (department_id, name)
);

-- ============================================================
-- TABLE: subjects
-- ============================================================

CREATE TABLE subjects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id  UUID NOT NULL REFERENCES teachers(id) ON DELETE RESTRICT,
  name        TEXT NOT NULL,
  course_code TEXT NOT NULL UNIQUE,   -- e.g. 'CS201'
  credits     INT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: contributors
-- ============================================================

CREATE TABLE contributors (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roll_number     TEXT NOT NULL UNIQUE,
  department_id   UUID REFERENCES departments(id) ON DELETE SET NULL,
  total_approved  INT NOT NULL DEFAULT 0,
  total_pending   INT NOT NULL DEFAULT 0,
  total_rejected  INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: papers
-- ============================================================

CREATE TABLE papers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relations
  department_id   UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  teacher_id      UUID NOT NULL REFERENCES teachers(id) ON DELETE RESTRICT,
  subject_id      UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  contributor_id  UUID REFERENCES contributors(id) ON DELETE SET NULL,

  -- Metadata
  exam_type       exam_type NOT NULL,
  semester        semester_number NOT NULL,
  term            term_type NOT NULL,
  year            SMALLINT NOT NULL CHECK (year >= 2000 AND year <= 2100),

  -- File
  file_path       TEXT NOT NULL,       -- Supabase storage path
  file_name       TEXT NOT NULL,       -- Original filename
  file_type       TEXT NOT NULL,       -- MIME type
  file_size       BIGINT NOT NULL,     -- bytes
  file_url        TEXT,                -- Public URL (set on approval)

  -- Submission tracking
  roll_number     TEXT NOT NULL,
  upload_ip       INET,
  status          paper_status NOT NULL DEFAULT 'Pending',

  -- Admin notes
  admin_note      TEXT,
  reviewed_by     UUID,               -- References auth.users (admin)
  reviewed_at     TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES (for performance at scale)
-- ============================================================

-- Papers filtering indexes
CREATE INDEX idx_papers_department    ON papers(department_id);
CREATE INDEX idx_papers_teacher       ON papers(teacher_id);
CREATE INDEX idx_papers_subject       ON papers(subject_id);
CREATE INDEX idx_papers_semester      ON papers(semester);
CREATE INDEX idx_papers_year          ON papers(year);
CREATE INDEX idx_papers_status        ON papers(status);
CREATE INDEX idx_papers_term          ON papers(term);
CREATE INDEX idx_papers_exam_type     ON papers(exam_type);
CREATE INDEX idx_papers_contributor   ON papers(contributor_id);
CREATE INDEX idx_papers_roll_number   ON papers(roll_number);

-- Composite index for duplicate detection
CREATE UNIQUE INDEX idx_papers_unique_approved
  ON papers(department_id, teacher_id, subject_id, exam_type, semester, term, year)
  WHERE status = 'Approved';

-- Composite for fast public listing
CREATE INDEX idx_papers_public_listing
  ON papers(status, year DESC, created_at DESC);

-- Full text search on subject name + teacher name (via join, use trigram)
CREATE INDEX idx_subjects_name_trgm ON subjects USING gin(name gin_trgm_ops);
CREATE INDEX idx_teachers_name_trgm ON teachers USING gin(name gin_trgm_ops);

-- Contributors leaderboard
CREATE INDEX idx_contributors_approved ON contributors(total_approved DESC);
CREATE INDEX idx_contributors_roll     ON contributors(roll_number);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_teachers_updated_at
  BEFORE UPDATE ON teachers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_subjects_updated_at
  BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_papers_updated_at
  BEFORE UPDATE ON papers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_contributors_updated_at
  BEFORE UPDATE ON contributors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Sync contributor counts when paper status changes
CREATE OR REPLACE FUNCTION sync_contributor_counts()
RETURNS TRIGGER AS $$
DECLARE
  v_contributor_id UUID;
BEGIN
  -- Determine which contributor to update
  IF TG_OP = 'DELETE' THEN
    v_contributor_id := OLD.contributor_id;
  ELSE
    v_contributor_id := NEW.contributor_id;
  END IF;

  IF v_contributor_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  UPDATE contributors SET
    total_approved = (
      SELECT COUNT(*) FROM papers
      WHERE contributor_id = v_contributor_id AND status = 'Approved'
    ),
    total_pending = (
      SELECT COUNT(*) FROM papers
      WHERE contributor_id = v_contributor_id AND status = 'Pending'
    ),
    total_rejected = (
      SELECT COUNT(*) FROM papers
      WHERE contributor_id = v_contributor_id AND status = 'Rejected'
    )
  WHERE id = v_contributor_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_contributor_counts
  AFTER INSERT OR UPDATE OF status OR DELETE ON papers
  FOR EACH ROW EXECUTE FUNCTION sync_contributor_counts();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE departments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects     ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributors ENABLE ROW LEVEL SECURITY;

-- Public read: departments
CREATE POLICY "Public read departments"
  ON departments FOR SELECT USING (is_active = TRUE);

-- Public read: teachers
CREATE POLICY "Public read teachers"
  ON teachers FOR SELECT USING (is_active = TRUE);

-- Public read: subjects
CREATE POLICY "Public read subjects"
  ON subjects FOR SELECT USING (is_active = TRUE);

-- Public read: approved papers only
CREATE POLICY "Public read approved papers"
  ON papers FOR SELECT USING (status = 'Approved');

-- Public read: contributors
CREATE POLICY "Public read contributors"
  ON contributors FOR SELECT TO anon USING (TRUE);

-- Anon can insert pending papers (via service role in API)
-- All writes go through service role (backend API), not direct client

-- Service role bypasses RLS — used only in server actions

-- ============================================================
-- SEED: Default Departments (NTU)
-- ============================================================

INSERT INTO departments (name, code) VALUES
  ('Department of Computer Science', 'CS'),
  ('Textile Engineering', 'TE'),
  ('Mechanical Engineering', 'ME'),
  ('Management Sciences', 'MS'),
  ('Electrical Engineering', 'EE'),
  ('Chemical Engineering', 'CHE'),
  ('Environmental Sciences', 'ENV')
ON CONFLICT DO NOTHING;

-- ============================================================
-- STORAGE BUCKETS (run in Supabase dashboard or via API)
-- ============================================================
-- Bucket: "papers" — private, accessed via signed URLs
-- Bucket: "papers-public" — public, for approved papers only

-- ============================================================
-- VIEWS (for convenient querying)
-- ============================================================

CREATE OR REPLACE VIEW v_papers_public AS
  SELECT
    p.id,
    p.exam_type,
    p.semester,
    p.term,
    p.year,
    p.file_url,
    p.file_name,
    p.file_type,
    p.created_at,
    d.id AS department_id,
    d.name AS department_name,
    d.code AS department_code,
    t.id AS teacher_id,
    t.name AS teacher_name,
    s.id AS subject_id,
    s.name AS subject_name,
    s.course_code
  FROM papers p
  JOIN departments d ON d.id = p.department_id
  JOIN teachers t ON t.id = p.teacher_id
  JOIN subjects s ON s.id = p.subject_id
  WHERE p.status = 'Approved';

CREATE OR REPLACE VIEW v_leaderboard AS
  SELECT
    c.id,
    c.roll_number,
    c.total_approved,
    c.created_at,
    d.name AS department_name,
    d.code AS department_code,
    RANK() OVER (ORDER BY c.total_approved DESC) AS rank
  FROM contributors c
  LEFT JOIN departments d ON d.id = c.department_id
  WHERE c.total_approved > 0
  ORDER BY c.total_approved DESC;

CREATE OR REPLACE VIEW v_admin_dashboard AS
  SELECT
    (SELECT COUNT(*) FROM papers) AS total_papers,
    (SELECT COUNT(*) FROM papers WHERE status = 'Pending') AS pending_papers,
    (SELECT COUNT(*) FROM papers WHERE status = 'Approved') AS approved_papers,
    (SELECT COUNT(*) FROM papers WHERE status = 'Rejected') AS rejected_papers,
    (SELECT COUNT(*) FROM departments WHERE is_active = TRUE) AS departments_count,
    (SELECT COUNT(*) FROM teachers WHERE is_active = TRUE) AS teachers_count,
    (SELECT COUNT(*) FROM subjects WHERE is_active = TRUE) AS subjects_count,
    (SELECT COUNT(*) FROM contributors) AS contributors_count;
