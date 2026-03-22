import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.middleware';
import {
  validateBody,
  validateParams,
} from '../../shared/middleware/validate.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { successResponse } from '../../shared/utils/api-response';
import {
  emergencyProfileVehicleParamsSchema,
  upsertEmergencyProfileSchema,
} from './emergency-profile.schemas';
import { emergencyProfileService } from './emergency-profile.service';

const router = Router();

router.get(
  '/vehicles/:vehicleId/emergency-profile',
  authenticate,
  validateParams(emergencyProfileVehicleParamsSchema),
  asyncHandler(async (req, res) => {
    const { vehicleId } = req.params as { vehicleId: string };
    const profile = await emergencyProfileService.getByVehicle(req.user!.id, vehicleId);
    return successResponse(res, profile);
  }),
);

router.put(
  '/vehicles/:vehicleId/emergency-profile',
  authenticate,
  validateParams(emergencyProfileVehicleParamsSchema),
  validateBody(upsertEmergencyProfileSchema),
  asyncHandler(async (req, res) => {
    const { vehicleId } = req.params as { vehicleId: string };
    const profile = await emergencyProfileService.upsert(
      req.user!.id,
      vehicleId,
      req.body,
    );
    return successResponse(res, profile, 'Emergency profile saved');
  }),
);

export const emergencyProfileRouter = router;
