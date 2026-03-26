import { z } from 'zod';

export const updateUserProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional().nullable(),
    language: z.enum(['en', 'ar']).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });

export const switchRoleSchema = z.object({
  role: z.enum(['normal', 'taxi']),
});

export const updateDocumentVisibilitySettingsSchema = z
  .object({
    driving_license: z.boolean().optional(),
    rc: z.boolean().optional(),
    puc: z.boolean().optional(),
    insurance: z.boolean().optional(),
    other: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one setting must be provided',
  });
