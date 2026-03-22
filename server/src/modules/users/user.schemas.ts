import { z } from 'zod';

export const updateUserProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional().nullable(),
    language: z.enum(['en', 'ar']).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });
