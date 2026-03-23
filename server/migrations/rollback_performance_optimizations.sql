-- ============================================================================
-- ZenvyGo Performance Optimization Rollback
-- Version: 1.0.0
-- Date: March 23, 2026
-- Description: Removes all performance indexes added by the optimization migration
-- ============================================================================

-- WARNING: Only run this if you need to revert the performance optimizations
-- This will remove all indexes and may slow down queries significantly

-- ============================================================================
-- SECTION 1: DROP VEHICLES TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_vehicles_owner_status ON vehicles;
DROP INDEX IF EXISTS idx_vehicles_created_at ON vehicles;
DROP INDEX IF EXISTS idx_vehicles_updated_at ON vehicles;

-- ============================================================================
-- SECTION 2: DROP TAGS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_tags_token ON tags;
DROP INDEX IF EXISTS idx_tags_vehicle_id ON tags;
DROP INDEX IF EXISTS idx_tags_owner_state ON tags;
DROP INDEX IF EXISTS idx_tags_created_at ON tags;
DROP INDEX IF EXISTS idx_tags_type_state ON tags;

-- ============================================================================
-- SECTION 3: DROP CONTACT SESSIONS INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_contact_sessions_owner_status ON contact_sessions;
DROP INDEX IF EXISTS idx_contact_sessions_vehicle_id ON contact_sessions;
DROP INDEX IF EXISTS idx_contact_sessions_tag_id ON contact_sessions;
DROP INDEX IF EXISTS idx_contact_sessions_expires_at ON contact_sessions;
DROP INDEX IF EXISTS idx_contact_sessions_created_at ON contact_sessions;
DROP INDEX IF EXISTS idx_contact_sessions_reason_status ON contact_sessions;

-- ============================================================================
-- SECTION 4: DROP ALERTS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_alerts_user_read ON alerts;
DROP INDEX IF EXISTS idx_alerts_session_id ON alerts;
DROP INDEX IF EXISTS idx_alerts_created_at ON alerts;
DROP INDEX IF EXISTS idx_alerts_user_severity ON alerts;

-- ============================================================================
-- SECTION 5: DROP EMERGENCY PROFILES INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_emergency_profiles_vehicle_id ON emergency_profiles;
DROP INDEX IF EXISTS idx_emergency_profiles_updated_at ON emergency_profiles;

-- ============================================================================
-- SECTION 6: DROP REFRESH TOKENS INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_refresh_tokens_user_id ON refresh_tokens;
DROP INDEX IF EXISTS idx_refresh_tokens_expires_at ON refresh_tokens;
DROP INDEX IF EXISTS idx_refresh_tokens_token_hash ON refresh_tokens;

-- ============================================================================
-- SECTION 7: DROP USERS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_users_email ON users;
DROP INDEX IF EXISTS idx_users_email_verified ON users;

-- ============================================================================
-- SECTION 8: DROP PII VAULT INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_pii_vault_user_field ON pii_vault_entries;

-- ============================================================================
-- SECTION 9: OPTIMIZE TABLES AFTER INDEX REMOVAL
-- ============================================================================

OPTIMIZE TABLE vehicles;
OPTIMIZE TABLE tags;
OPTIMIZE TABLE contact_sessions;
OPTIMIZE TABLE alerts;
OPTIMIZE TABLE emergency_profiles;
OPTIMIZE TABLE refresh_tokens;
OPTIMIZE TABLE users;
OPTIMIZE TABLE pii_vault_entries;

-- ============================================================================
-- COMPLETE - Rollback completed successfully
-- ============================================================================

SELECT 'Performance optimization rollback completed. Indexes removed.' as status;
