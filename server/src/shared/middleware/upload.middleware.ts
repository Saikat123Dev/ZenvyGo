import multer from 'multer';
import { BadRequestError } from '../utils/api-error';

// Memory storage for buffer uploads (used with FTP service)
const storage = multer.memoryStorage();

// Allowed MIME types for document uploads
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// File filter to validate uploads
const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    cb(
      new BadRequestError(
        'Invalid file type. Only JPEG, PNG, WebP, and PDF files are allowed.',
      ),
    );
    return;
  }
  cb(null, true);
};

// Document upload middleware (single file)
export const documentUpload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
}).single('file');

// Profile photo upload middleware (single file)
export const photoUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for photos
  },
  fileFilter: (req, file, cb) => {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!imageTypes.includes(file.mimetype.toLowerCase())) {
      cb(
        new BadRequestError(
          'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
        ),
      );
      return;
    }
    cb(null, true);
  },
}).single('photo');

// Helper to check if file type is image
export function isImageFile(mimeType: string): boolean {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return imageTypes.includes(mimeType.toLowerCase());
}

// Helper to check if file type is PDF
export function isPdfFile(mimeType: string): boolean {
  return mimeType.toLowerCase() === 'application/pdf';
}

// Export constants for use elsewhere
export { ALLOWED_MIME_TYPES, MAX_FILE_SIZE };
