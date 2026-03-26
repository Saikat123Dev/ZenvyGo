-- Re-add is_driver column
ALTER TABLE users
  ADD COLUMN is_driver TINYINT(1) NOT NULL DEFAULT 0 AFTER profile_photo_url;
CREATE INDEX idx_users_is_driver ON users(is_driver);

-- Remove role and document_visibility_settings
ALTER TABLE users DROP INDEX idx_users_role;
ALTER TABLE users DROP COLUMN document_visibility_settings;
ALTER TABLE users DROP COLUMN role;
