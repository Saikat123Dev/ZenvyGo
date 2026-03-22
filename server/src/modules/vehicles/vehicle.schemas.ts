import { z } from 'zod';

export const vehicleIdParamsSchema = z.object({
  vehicleId: z.string().uuid(),
});

const vehicleBaseSchema = {
  plateNumber: z.string().trim().min(2).max(20),
  plateRegion: z.string().trim().min(1).max(20).optional().nullable(),
  make: z.string().trim().min(1).max(50).optional().nullable(),
  model: z.string().trim().min(1).max(50).optional().nullable(),
  color: z.string().trim().min(1).max(30).optional().nullable(),
  year: z.number().int().min(1950).max(2100).optional().nullable(),
};

export const createVehicleSchema = z.object(vehicleBaseSchema);

export const updateVehicleSchema = z
  .object({
    ...vehicleBaseSchema,
    status: z.enum(['active', 'archived']).optional(),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });
