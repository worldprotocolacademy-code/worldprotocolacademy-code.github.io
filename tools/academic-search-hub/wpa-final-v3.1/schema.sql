-- WPA Academic Search Hub v3.1 Mandatory SQLite Schema
CREATE TABLE IF NOT EXISTS processed_records (
  record_id TEXT PRIMARY KEY,
  doi TEXT UNIQUE,
  title TEXT,
  year INTEGER,
  title_year_hash TEXT,
  source_database TEXT,
  traceability_score INTEGER,
  authority_score INTEGER,
  rag_included BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_processed_doi ON processed_records(doi);
CREATE INDEX IF NOT EXISTS idx_processed_title_year ON processed_records(title_year_hash, year);

CREATE TABLE IF NOT EXISTS completed_domains (
  domain TEXT PRIMARY KEY,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS authority_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_id TEXT,
  doi TEXT,
  authority_score INTEGER,
  tier TEXT,
  reasoning TEXT,
  flags TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS whitelist_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_doi TEXT,
  whitelist_type TEXT,
  whitelist_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS manual_overrides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_by TEXT,
  value TEXT,
  override_data TEXT,
  approved_by TEXT,
  date TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS source_traceability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_id TEXT,
  doi_score INTEGER,
  url_score INTEGER,
  db_score INTEGER,
  authors_score INTEGER,
  year_score INTEGER,
  abstract_score INTEGER,
  oa_score INTEGER,
  total_score INTEGER,
  tier TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rag_gate_decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_id TEXT,
  authority_score INTEGER,
  traceability_score INTEGER,
  source_verified BOOLEAN,
  decision TEXT,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
