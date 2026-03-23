-- Database optimization: Add indexes for frequently queried columns

-- Vehicles table indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_owner_status ON vehicles(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON vehicles(created_at DESC);

-- Tags table indexes
CREATE INDEX IF NOT EXISTS idx_tags_vehicle_id ON tags(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_tags_token ON tags(token);
CREATE INDEX IF NOT EXISTS idx_tags_state ON tags(state);
CREATE INDEX IF NOT EXISTS idx_tags_created_at ON tags(created_at DESC);

-- Contact sessions indexes
CREATE INDEX IF NOT EXISTS idx_contact_sessions_owner_status ON contact_sessions(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_contact_sessions_vehicle_id ON contact_sessions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_contact_sessions_expires_at ON contact_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_contact_sessions_created_at ON contact_sessions(created_at DESC);

-- Alerts table indexes
CREATE INDEX IF NOT EXISTS idx_alerts_user_read ON alerts(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_session_id ON alerts(session_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);

-- Emergency profiles indexes
CREATE INDEX IF NOT EXISTS idx_emergency_profiles_vehicle_id ON emergency_profiles(vehicle_id);

-- Refresh tokens indexes
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- PII vault indexes
CREATE INDEX IF NOT EXISTS idx_pii_vault_pii_type ON pii_vault_entries(pii_type);
CREATE INDEX IF NOT EXISTS idx_pii_vault_pii_hash ON pii_vault_entries(pii_hash);
