import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.middleware';
import { publicCorsMiddleware } from '../../shared/middleware/cors.middleware';
import { rateLimitService } from '../../shared/cache/rate-limiter.service';
import {
  validateBody,
  validateParams,
} from '../../shared/middleware/validate.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { successResponse } from '../../shared/utils/api-response';
import {
  contactSessionIdParamsSchema,
  createPublicContactSessionSchema,
} from './contact.schemas';
import { contactService } from './contact.service';

const router = Router();

router.post(
  '/public/contact-sessions',
  publicCorsMiddleware,
  validateBody(createPublicContactSessionSchema),
  asyncHandler(async (req, res) => {
    const session = await contactService.createPublicSession({
      ...req.body,
      requesterIp: rateLimitService.getClientIP(req),
    });
    return successResponse(res, session, 'Contact session recorded', 201);
  }),
);

router.get(
  '/contact-sessions',
  authenticate,
  asyncHandler(async (req, res) => {
    const sessions = await contactService.listByOwner(req.user!.id);
    return successResponse(res, sessions);
  }),
);

router.patch(
  '/contact-sessions/:sessionId/resolve',
  authenticate,
  validateParams(contactSessionIdParamsSchema),
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params as { sessionId: string };
    const session = await contactService.resolve(req.user!.id, sessionId);
    return successResponse(res, session, 'Contact session resolved');
  }),
);

export const contactRouter = router;
