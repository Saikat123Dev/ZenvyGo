-- Add email and password authentication columns to users table
ALTER TABLE users
  ADD COLUMN email VARCHAR(255) NULL UNIQUE AFTER phone_last4,
  ADD COLUMN password_hash VARCHAR(255) NULL AFTER email,
  ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0 AFTER password_hash;

-- Add index for email lookups
CREATE INDEX idx_users_email ON users(email);

-- Make phone_ref nullable since we're moving to email-based auth
ALTER TABLE users
  MODIFY COLUMN phone_ref CHAR(36) NULL;
