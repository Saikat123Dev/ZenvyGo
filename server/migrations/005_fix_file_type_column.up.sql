-- Fix file_type column to store full MIME types instead of simplified enum
-- Change from ENUM('image', 'pdf') to VARCHAR(50) to support:
-- - image/jpeg
-- - image/png
-- - image/webp
-- - application/pdf

ALTER TABLE driver_documents
  MODIFY COLUMN file_type VARCHAR(50) NOT NULL;
