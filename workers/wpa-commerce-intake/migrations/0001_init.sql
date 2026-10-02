CREATE TABLE IF NOT EXISTS commerce_requests (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING_HUMAN_GATE',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organisation TEXT,
  request_type TEXT NOT NULL,
  product_plan TEXT NOT NULL,
  period TEXT,
  payment_route TEXT NOT NULL,
  language TEXT,
  note TEXT,
  terms_version TEXT NOT NULL,
  privacy_version TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'website'
);

CREATE INDEX IF NOT EXISTS idx_commerce_requests_created_at
  ON commerce_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_commerce_requests_status
  ON commerce_requests(status);
