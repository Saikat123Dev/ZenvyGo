-- Driver Documents Table
-- Stores uploaded documents like Driving License, Vehicle Registration, PUC, Insurance, etc.
-- Driving License is linked to user_id (driver-level)
-- RC, PUC, Insurance are linked to vehicle_id (vehicle-level)
CREATE TABLE IF NOT EXISTS driver_documents (
  id CHAR(36) PRIMARY KEY,

  -- Ownership: user_id for driver license, vehicle_id for vehicle documents
  user_id CHAR(36) NULL,
  vehicle_id CHAR(36) NULL,

  -- Document metadata
  document_type ENUM('driving_license', 'rc', 'puc', 'insurance', 'other') NOT NULL,
  document_name VARCHAR(100) NOT NULL,
  document_number VARCHAR(100) NULL,

  -- File storage (FTP)
  file_url VARCHAR(512) NOT NULL,
  file_type ENUM('image', 'pdf') NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size_bytes INT UNSIGNED NOT NULL,

  -- Validity dates
  issued_at DATE NULL,
  expires_at DATE NULL,

  -- Verification status
  status ENUM('pending', 'verified', 'rejected', 'expired') NOT NULL DEFAULT 'pending',

  -- Visibility control for passenger view
  is_visible_to_passenger TINYINT(1) NOT NULL DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,

  -- Foreign key constraints
  CONSTRAINT fk_driver_documents_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_driver_documents_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,

  -- Indexes for efficient queries
  INDEX idx_driver_documents_user (user_id),
  INDEX idx_driver_documents_vehicle (vehicle_id),
  INDEX idx_driver_documents_type (document_type),
  INDEX idx_driver_documents_status (status),
  INDEX idx_driver_documents_visible (is_visible_to_passenger),
  INDEX idx_driver_documents_vehicle_visible (vehicle_id, is_visible_to_passenger, deleted_at)
);

-- Add driver profile fields to users table
ALTER TABLE users
  ADD COLUMN profile_photo_url TEXT NULL AFTER name,
  ADD COLUMN is_driver TINYINT(1) NOT NULL DEFAULT 0 AFTER profile_photo_url;

-- Index for driver lookup
CREATE INDEX idx_users_is_driver ON users(is_driver);
