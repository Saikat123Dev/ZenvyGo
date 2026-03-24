import { z } from 'zod';

// Document types
export const DOCUMENT_TYPES = [
  'driving_license',
  'rc',
  'puc',
  'insurance',
  'other',
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

// Document status
export const DOCUMENT_STATUSES = [
  'pending',
  'verified',
  'rejected',
  'expired',
] as const;

export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

// File types
export const FILE_TYPES = ['image', 'pdf'] as const;

export type FileType = (typeof FILE_TYPES)[number];

// Param schemas
export const documentIdParamsSchema = z.object({
  documentId: z.string().uuid(),
});

export const vehicleIdParamsSchema = z.object({
  vehicleId: z.string().uuid(),
});

// Create document schema (used with multipart form)
export const createDocumentSchema = z.object({
  vehicleId: z.string().uuid().optional(), // Required for non-license docs
  documentType: z.enum(DOCUMENT_TYPES),
  documentName: z.string().trim().min(1).max(100),
  documentNumber: z.string().trim().max(100).optional().nullable(),
  issuedAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  isVisibleToPassenger: z
    .preprocess((val) => {
      if (typeof val === 'string') {
        return val === 'true' || val === '1';
      }
      return val;
    }, z.boolean())
    .default(true),
});

// Update document schema
export const updateDocumentSchema = z
  .object({
    documentName: z.string().trim().min(1).max(100).optional(),
    documentNumber: z.string().trim().max(100).optional().nullable(),
    issuedAt: z.string().optional().nullable(),
    expiresAt: z.string().optional().nullable(),
    isVisibleToPassenger: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });

// Toggle visibility schema
export const toggleVisibilitySchema = z.object({
  isVisibleToPassenger: z.boolean(),
});

// Public driver profile request schema
export const publicDriverProfileSchema = z.object({
  token: z.string().trim().min(16).max(128),
});

// Human-readable document type names
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  driving_license: 'Driving License',
  rc: 'Vehicle Registration (RC)',
  puc: 'PUC Certificate',
  insurance: 'Insurance',
  other: 'Other Document',
};
