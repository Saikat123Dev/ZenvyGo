import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.middleware';
import { validateBody, validateParams } from '../../shared/middleware/validate.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { noContentResponse, successResponse } from '../../shared/utils/api-response';
import { createVehicleSchema, updateVehicleSchema, vehicleIdParamsSchema } from './vehicle.schemas';
import { vehicleService } from './vehicle.service';

const router = Router();

router.get(
  '/vehicles',
  authenticate,
  asyncHandler(async (req, res) => {
    const vehicles = await vehicleService.listByOwner(req.user!.id);
    return successResponse(res, vehicles);
  }),
);

router.post(
  '/vehicles',
  authenticate,
  validateBody(createVehicleSchema),
  asyncHandler(async (req, res) => {
    const vehicle = await vehicleService.create(req.user!.id, req.body);
    return successResponse(res, vehicle, 'Vehicle created', 201);
  }),
);

router.get(
  '/vehicles/:vehicleId',
  authenticate,
  validateParams(vehicleIdParamsSchema),
  asyncHandler(async (req, res) => {
    const { vehicleId } = req.params as { vehicleId: string };
    const vehicle = await vehicleService.getOwnedVehicle(req.user!.id, vehicleId);
    return successResponse(res, vehicle);
  }),
);

router.patch(
  '/vehicles/:vehicleId',
  authenticate,
  validateParams(vehicleIdParamsSchema),
  validateBody(updateVehicleSchema),
  asyncHandler(async (req, res) => {
    const { vehicleId } = req.params as { vehicleId: string };
    const vehicle = await vehicleService.update(req.user!.id, vehicleId, req.body);
    return successResponse(res, vehicle, 'Vehicle updated');
  }),
);

router.delete(
  '/vehicles/:vehicleId',
  authenticate,
  validateParams(vehicleIdParamsSchema),
  asyncHandler(async (req, res) => {
    const { vehicleId } = req.params as { vehicleId: string };
    await vehicleService.archive(req.user!.id, vehicleId);
    return noContentResponse(res);
  }),
);

export const vehicleRouter = router;
