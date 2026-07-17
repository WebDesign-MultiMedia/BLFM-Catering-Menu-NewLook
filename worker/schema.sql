-- Consent evidence for the SMS Receipt and Order Notifications program.
-- Apply with: wrangler d1 execute blfm_sms_consent --file=./schema.sql

CREATE TABLE IF NOT EXISTS consent_records (
  id                    TEXT PRIMARY KEY,
  full_name             TEXT NOT NULL,
  phone_e164            TEXT NOT NULL,
  consent_status        TEXT NOT NULL,               -- 'granted'
  consent_timestamp_utc TEXT NOT NULL,                -- ISO 8601 UTC
  page_url              TEXT NOT NULL,
  disclosure_text       TEXT NOT NULL,
  privacy_policy_url    TEXT NOT NULL,
  terms_url             TEXT NOT NULL,
  policy_version        TEXT NOT NULL,
  reference_number      TEXT,
  ip_hash               TEXT,
  user_agent            TEXT,
  confirmation_sms_sent INTEGER NOT NULL DEFAULT 0,
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_consent_phone      ON consent_records(phone_e164);
CREATE INDEX IF NOT EXISTS idx_consent_created_at ON consent_records(created_at);

-- Basic per-IP rate limiting log (see RATE_LIMIT_MAX/RATE_LIMIT_WINDOW_MIN in src/index.js)
CREATE TABLE IF NOT EXISTS rate_limit_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_hash    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ratelimit_ip_time ON rate_limit_log(ip_hash, created_at);
