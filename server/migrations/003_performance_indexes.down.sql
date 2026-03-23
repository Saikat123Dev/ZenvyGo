-- Rollback database optimization indexes

-- Vehicles table indexes
DROP INDEX IF EXISTS idx_vehicles_owner_status ON vehicles;
DROP INDEX IF EXISTS idx_vehicles_created_at ON vehicles;

-- Tags table indexes
DROP INDEX IF EXISTS idx_tags_created_at ON tags;

-- Contact sessions indexes
DROP INDEX IF EXISTS idx_contact_sessions_owner_status ON contact_sessions;
DROP INDEX IF EXISTS idx_contact_sessions_created_at ON contact_sessions;

-- Alerts table indexes
DROP INDEX IF EXISTS idx_alerts_user_read ON alerts;
DROP INDEX IF EXISTS idx_alerts_session_id ON alerts;
DROP INDEX IF EXISTS idx_alerts_created_at ON alerts;

-- Emergency profiles indexes
DROP INDEX IF EXISTS idx_emergency_profiles_vehicle_id ON emergency_profiles;

-- Refresh tokens indexes
DROP INDEX IF EXISTS idx_refresh_tokens_expires_at ON refresh_tokens;
