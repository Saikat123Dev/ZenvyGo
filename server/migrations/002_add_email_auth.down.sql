-- Rollback email authentication changes
DROP INDEX idx_users_email ON users;

ALTER TABLE users
  DROP COLUMN email_verified,
  DROP COLUMN password_hash,
  DROP COLUMN email;

ALTER TABLE users
  MODIFY COLUMN phone_ref CHAR(36) NOT NULL;
