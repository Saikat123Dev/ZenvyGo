-- Rollback database optimization indexes

-- Vehicles table indexes
DROP INDEX IF EXISTS idx_vehicles_owner_status ON vehicles;
DROP INDEX IF EXISTS idx_vehicles_created_at ON vehicles;

-- Tags table indexes
DROP INDEX IF EXISTS idx_tags_vehicle_id ON tags;
DROP INDEX IF EXISTS idx_tags_token ON tags;
DROP INDEX IF EXISTS idx_tags_owner_state ON tags;
DROP INDEX IF EXISTS idx_tags_created_at ON tags;

-- Contact sessions indexes
DROP INDEX IF EXISTS idx_contact_sessions_owner_status ON contact_sessions;
DROP INDEX IF EXISTS idx_contact_sessions_vehicle_id ON contact_sessions;
DROP INDEX IF EXISTS idx_contact_sessions_expires_at ON contact_sessions;
DROP INDEX IF EXISTS idx_contact_sessions_created_at ON contact_sessions;

-- Alerts table indexes
DROP INDEX IF EXISTS idx_alerts_user_read ON alerts;
DROP INDEX IF EXISTS idx_alerts_session_id ON alerts;
DROP INDEX IF EXISTS idx_alerts_created_at ON alerts;

-- Emergency profiles indexes
DROP INDEX IF EXISTS idx_emergency_profiles_vehicle_id ON emergency_profiles;

-- Refresh tokens indexes
DROP INDEX IF EXISTS idx_refresh_tokens_user_id ON refresh_tokens;
DROP INDEX IF EXISTS idx_refresh_tokens_expires_at ON refresh_tokens;

-- PII vault indexes
DROP INDEX IF EXISTS idx_pii_vault_user_id ON pii_vault_entries;
DROP INDEX IF EXISTS idx_pii_vault_field_name ON pii_vault_entries;
