-- Rollback file_type column to original ENUM type
-- WARNING: This will truncate existing MIME types to 'image' or 'pdf'

ALTER TABLE driver_documents
  MODIFY COLUMN file_type ENUM('image', 'pdf') NOT NULL;
