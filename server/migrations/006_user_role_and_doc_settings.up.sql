-- Add role column to users table (replaces the unused is_driver column)
ALTER TABLE users
  ADD COLUMN role ENUM('normal', 'taxi') NOT NULL DEFAULT 'normal' AFTER name;

-- Add document visibility settings as JSON
-- Default: all document types visible to passengers
ALTER TABLE users
  ADD COLUMN document_visibility_settings JSON NULL AFTER role;

-- Index for role-based queries
CREATE INDEX idx_users_role ON users(role);

-- Drop the unused is_driver column from migration 004
ALTER TABLE users DROP INDEX idx_users_is_driver;
ALTER TABLE users DROP COLUMN is_driver;
