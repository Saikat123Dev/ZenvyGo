import { Router } from 'express';
import { RATE_LIMITS } from '../../shared/config/constants';
import { authenticate } from '../../shared/middleware/authenticate.middleware';
import { publicCorsMiddleware } from '../../shared/middleware/cors.middleware';
import { createRateLimitMiddleware } from '../../shared/cache/rate-limiter.service';
import {
  validateBody,
  validateParams,
} from '../../shared/middleware/validate.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { successResponse } from '../../shared/utils/api-response';
import { createTagSchema, resolveTagSchema, tagIdParamsSchema } from './tag.schemas';
import { tagService } from './tag.service';

const router = Router();

router.get(
  '/tags',
  authenticate,
  asyncHandler(async (req, res) => {
    const tags = await tagService.listByOwner(req.user!.id);
    return successResponse(res, tags);
  }),
);

router.post(
  '/tags',
  authenticate,
  validateBody(createTagSchema),
  asyncHandler(async (req, res) => {
    const tag = await tagService.create(req.user!.id, req.body);
    return successResponse(res, tag, 'Tag created', 201);
  }),
);

router.post(
  '/tags/:tagId/activate',
  authenticate,
  validateParams(tagIdParamsSchema),
  asyncHandler(async (req, res) => {
    const { tagId } = req.params as { tagId: string };
    const tag = await tagService.activate(req.user!.id, tagId);
    return successResponse(res, tag, 'Tag activated');
  }),
);

router.post(
  '/public/tags/resolve',
  publicCorsMiddleware,
  createRateLimitMiddleware(
    {
      windowMs: RATE_LIMITS.TAG_RESOLVE.WINDOW_MS,
      max: RATE_LIMITS.TAG_RESOLVE.MAX,
    },
    'public:tag:',
  ),
  validateBody(resolveTagSchema),
  asyncHandler(async (req, res) => {
    const tag = await tagService.resolveToken(req.body.token);
    return successResponse(res, tag);
  }),
);

export const tagRouter = router;
