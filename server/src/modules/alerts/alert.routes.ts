import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.middleware';
import { validateParams } from '../../shared/middleware/validate.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { successResponse } from '../../shared/utils/api-response';
import { z } from 'zod';
import { alertService } from './alert.service';

const router = Router();
const alertIdParamsSchema = z.object({
  alertId: z.string().uuid(),
});

router.get(
  '/alerts',
  authenticate,
  asyncHandler(async (req, res) => {
    const alerts = await alertService.listByUser(req.user!.id);
    return successResponse(res, alerts);
  }),
);

router.patch(
  '/alerts/read-all',
  authenticate,
  asyncHandler(async (req, res) => {
    await alertService.markAllRead(req.user!.id);
    return successResponse(res, null, 'All alerts marked as read');
  }),
);

router.patch(
  '/alerts/:alertId/read',
  authenticate,
  validateParams(alertIdParamsSchema),
  asyncHandler(async (req, res) => {
    const { alertId } = req.params as { alertId: string };
    const alert = await alertService.markRead(req.user!.id, alertId);
    return successResponse(res, alert, 'Alert marked as read');
  }),
);

export const alertRouter = router;
