import { z } from 'zod';

export const emergencyProfileVehicleParamsSchema = z.object({
  vehicleId: z.string().uuid(),
});

export const upsertEmergencyProfileSchema = z.object({
  contacts: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(100),
        phone: z.string().trim().min(8).max(20),
        relation: z.string().trim().min(1).max(50).optional().nullable(),
      }),
    )
    .max(3),
  medicalNotes: z.string().trim().max(1000).optional().nullable(),
  roadsideAssistanceNumber: z.string().trim().min(8).max(20).optional().nullable(),
});
