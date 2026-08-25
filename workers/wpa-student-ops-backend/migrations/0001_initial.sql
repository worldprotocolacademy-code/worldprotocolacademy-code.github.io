PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('student','reviewer','admin','issuer')),
  granted_by TEXT NOT NULL,
  granted_at TEXT NOT NULL,
  revoked_at TEXT,
  PRIMARY KEY(email, role)
);

CREATE TABLE IF NOT EXISTS applications (
  application_id TEXT PRIMARY KEY,
  student_email TEXT NOT NULL,
  programme_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('draft','submitted','under_review','admitted','rejected','withdrawn')),
  consent_version TEXT,
  consent_at TEXT,
  submitted_at TEXT,
  decided_at TEXT,
  decided_by TEXT,
  decision_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assessments (
  assessment_id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  student_email TEXT NOT NULL,
  programme_id TEXT NOT NULL,
  rules_version TEXT NOT NULL,
  calculated_result REAL,
  integrity_status TEXT NOT NULL DEFAULT 'pending',
  human_confirmed_result REAL,
  status TEXT NOT NULL CHECK(status IN ('pending','submitted','under_review','confirmed_pass','confirmed_fail','void')),
  confirmed_by TEXT,
  confirmed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(application_id) REFERENCES applications(application_id)
);

CREATE TABLE IF NOT EXISTS certificates (
  certificate_id TEXT PRIMARY KEY,
  assessment_id TEXT NOT NULL,
  student_email TEXT NOT NULL,
  programme_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('eligible','pending_authorisation','authorised','issued','revoked')),
  serial TEXT UNIQUE,
  verification_code TEXT UNIQUE,
  authorised_by TEXT,
  authorised_at TEXT,
  issued_by TEXT,
  issued_at TEXT,
  revoked_by TEXT,
  revoked_at TEXT,
  revocation_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(assessment_id) REFERENCES assessments(assessment_id)
);

CREATE TABLE IF NOT EXISTS human_approvals (
  approval_id TEXT PRIMARY KEY,
  object_type TEXT NOT NULL,
  object_id TEXT NOT NULL,
  gate_class TEXT NOT NULL CHECK(gate_class IN ('HG2','HG3','HG4')),
  action TEXT NOT NULL,
  decision TEXT NOT NULL CHECK(decision IN ('approved','rejected')),
  actor_email TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  reason TEXT NOT NULL,
  previous_state TEXT,
  new_state TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_events (
  audit_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  object_type TEXT NOT NULL,
  object_id TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  request_id TEXT NOT NULL,
  previous_state TEXT,
  new_state TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_email);
CREATE INDEX IF NOT EXISTS idx_assessments_application ON assessments(application_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student ON certificates(student_email);
CREATE INDEX IF NOT EXISTS idx_audit_object ON audit_events(object_type, object_id);
CREATE INDEX IF NOT EXISTS idx_approvals_object ON human_approvals(object_type, object_id);

CREATE TRIGGER IF NOT EXISTS audit_events_no_update
BEFORE UPDATE ON audit_events
BEGIN
  SELECT RAISE(ABORT, 'audit_events are append-only');
END;

CREATE TRIGGER IF NOT EXISTS audit_events_no_delete
BEFORE DELETE ON audit_events
BEGIN
  SELECT RAISE(ABORT, 'audit_events are append-only');
END;

CREATE TRIGGER IF NOT EXISTS human_approvals_no_update
BEFORE UPDATE ON human_approvals
BEGIN
  SELECT RAISE(ABORT, 'human_approvals are append-only');
END;

CREATE TRIGGER IF NOT EXISTS human_approvals_no_delete
BEFORE DELETE ON human_approvals
BEGIN
  SELECT RAISE(ABORT, 'human_approvals are append-only');
END;
