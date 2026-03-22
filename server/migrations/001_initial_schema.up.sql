CREATE TABLE IF NOT EXISTS pii_vault_entries (
  id CHAR(36) PRIMARY KEY,
  pii_type VARCHAR(32) NOT NULL,
  pii_hash CHAR(64) NOT NULL UNIQUE,
  encrypted_payload JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pii_vault_entries_type (pii_type)
);

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  phone_ref CHAR(36) NOT NULL UNIQUE,
  phone_last4 CHAR(4) NOT NULL,
  name VARCHAR(100) NULL,
  language ENUM('en', 'ar') NOT NULL DEFAULT 'en',
  country VARCHAR(3) NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_phone_ref
    FOREIGN KEY (phone_ref) REFERENCES pii_vault_entries(id)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_refresh_tokens_user (user_id),
  INDEX idx_refresh_tokens_expires_at (expires_at)
);

CREATE TABLE IF NOT EXISTS vehicles (
  id CHAR(36) PRIMARY KEY,
  owner_id CHAR(36) NOT NULL,
  plate_number VARCHAR(20) NOT NULL,
  plate_region VARCHAR(20) NULL,
  make VARCHAR(50) NULL,
  model VARCHAR(50) NULL,
  color VARCHAR(30) NULL,
  year INT NULL,
  status ENUM('active', 'archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT fk_vehicles_owner
    FOREIGN KEY (owner_id) REFERENCES users(id),
  INDEX idx_vehicles_owner (owner_id),
  INDEX idx_vehicles_status (status)
);

CREATE TABLE IF NOT EXISTS tags (
  id CHAR(36) PRIMARY KEY,
  vehicle_id CHAR(36) NOT NULL,
  token VARCHAR(128) NOT NULL UNIQUE,
  type ENUM('qr', 'etag') NOT NULL DEFAULT 'qr',
  state ENUM('generated', 'activated', 'suspended', 'retired') NOT NULL DEFAULT 'generated',
  qr_code_url LONGTEXT NOT NULL,
  activated_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tags_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  INDEX idx_tags_vehicle (vehicle_id),
  INDEX idx_tags_state (state)
);

CREATE TABLE IF NOT EXISTS contact_sessions (
  id CHAR(36) PRIMARY KEY,
  vehicle_id CHAR(36) NOT NULL,
  owner_id CHAR(36) NOT NULL,
  tag_id CHAR(36) NOT NULL,
  reason_code VARCHAR(64) NOT NULL,
  requested_channel ENUM('call', 'sms', 'whatsapp', 'in_app') NOT NULL,
  delivery_status ENUM('logged', 'queued', 'failed') NOT NULL DEFAULT 'logged',
  status ENUM('initiated', 'resolved', 'expired') NOT NULL DEFAULT 'initiated',
  requester_context JSON NULL,
  message VARCHAR(500) NULL,
  expires_at DATETIME NOT NULL,
  resolved_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_contact_sessions_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  CONSTRAINT fk_contact_sessions_owner
    FOREIGN KEY (owner_id) REFERENCES users(id),
  CONSTRAINT fk_contact_sessions_tag
    FOREIGN KEY (tag_id) REFERENCES tags(id),
  INDEX idx_contact_sessions_owner (owner_id),
  INDEX idx_contact_sessions_vehicle (vehicle_id),
  INDEX idx_contact_sessions_status (status),
  INDEX idx_contact_sessions_expires_at (expires_at)
);

CREATE TABLE IF NOT EXISTS alerts (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  session_id CHAR(36) NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  severity ENUM('info', 'warning', 'critical') NOT NULL DEFAULT 'info',
  channel ENUM('system', 'in_app') NOT NULL DEFAULT 'system',
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_alerts_user
    FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_alerts_session
    FOREIGN KEY (session_id) REFERENCES contact_sessions(id),
  INDEX idx_alerts_user (user_id),
  INDEX idx_alerts_read (is_read)
);

CREATE TABLE IF NOT EXISTS emergency_profiles (
  id CHAR(36) PRIMARY KEY,
  vehicle_id CHAR(36) NOT NULL UNIQUE,
  contacts_json JSON NULL,
  medical_notes TEXT NULL,
  roadside_assistance_number VARCHAR(32) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_emergency_profiles_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);
