-- Adds the `program` column to an existing consent_records table so it can
-- store consent for multiple SMS programs (BLFM, Julio Salas SMS Testing, ...).
-- Apply once against the already-live database with:
--   wrangler d1 execute blfm_sms_consent --remote --file=./migrations/0002_add_program_column.sql

ALTER TABLE consent_records ADD COLUMN program TEXT NOT NULL DEFAULT 'blfm_receipt_notifications';

CREATE INDEX IF NOT EXISTS idx_consent_program ON consent_records(program);
