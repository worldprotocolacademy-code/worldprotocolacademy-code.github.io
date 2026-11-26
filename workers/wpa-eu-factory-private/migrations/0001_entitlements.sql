-- Dedicated future entitlement database. No public mutation API or approved records.
CREATE TABLE IF NOT EXISTS entitlements (
  issuer TEXT NOT NULL,
  subject TEXT NOT NULL,
  email TEXT NOT NULL,
  plan TEXT NOT NULL CHECK(plan IN ('pro','extra')),
  state TEXT NOT NULL CHECK(state IN ('ACTIVE','REVOKED')),
  expires_at TEXT NOT NULL,
  PRIMARY KEY(issuer,subject)
);
