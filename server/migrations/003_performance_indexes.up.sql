-- Database optimization: Add indexes for frequently queried columns

-- Vehicles table indexes
-- Note: idx_vehicles_owner (owner_id) and idx_vehicles_status (status) already exist from initial schema
CREATE INDEX IF NOT EXISTS idx_vehicles_owner_status ON vehicles(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON vehicles(created_at DESC);

-- Tags table indexes
-- Note: idx_tags_vehicle (vehicle_id) and idx_tags_state (state) already exist from initial schema
-- Note: token has a UNIQUE constraint which already acts as an index
-- Note: tags table has no owner_id column; owner is accessed via vehicles join
CREATE INDEX IF NOT EXISTS idx_tags_created_at ON tags(created_at DESC);

-- Contact sessions indexes
-- Note: idx_contact_sessions_owner, idx_contact_sessions_vehicle, idx_contact_sessions_status,
--       and idx_contact_sessions_expires_at already exist from initial schema
CREATE INDEX IF NOT EXISTS idx_contact_sessions_owner_status ON contact_sessions(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_contact_sessions_created_at ON contact_sessions(created_at DESC);

-- Alerts table indexes
-- Note: idx_alerts_user (user_id) and idx_alerts_read (is_read) already exist from initial schema
CREATE INDEX IF NOT EXISTS idx_alerts_user_read ON alerts(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_session_id ON alerts(session_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);

-- Emergency profiles indexes
-- Note: vehicle_id is already a UNIQUE column (acts as an index)
CREATE INDEX IF NOT EXISTS idx_emergency_profiles_vehicle_id ON emergency_profiles(vehicle_id);

-- Refresh tokens indexes
-- Note: idx_refresh_tokens_user (user_id) and idx_refresh_tokens_expires_at already exist from initial schema
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
