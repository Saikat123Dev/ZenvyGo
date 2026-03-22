import { z } from 'zod';

export const tagIdParamsSchema = z.object({
  tagId: z.string().uuid(),
});

export const createTagSchema = z.object({
  vehicleId: z.string().uuid(),
  type: z.enum(['qr', 'etag']).default('qr'),
});

export const resolveTagSchema = z.object({
  token: z.string().trim().min(16).max(128),
});
