-- Remove driver index
DROP INDEX IF EXISTS idx_users_is_driver ON users;

-- Remove driver profile fields from users table (ignore if columns don't exist)
ALTER TABLE users
  DROP COLUMN IF EXISTS profile_photo_url,
  DROP COLUMN IF EXISTS is_driver;

-- Drop driver documents table
DROP TABLE IF EXISTS driver_documents;
