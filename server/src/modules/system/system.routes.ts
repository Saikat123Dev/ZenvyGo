import { Router } from 'express';
import { db } from '../../shared/database/connection';
import { redis } from '../../shared/cache/redis.client';
import { successResponse } from '../../shared/utils/api-response';

const router = Router();

router.get('/health', (_req, res) => {
  return successResponse(res, { status: 'ok' });
});

router.get('/ready', (_req, res) => {
  return successResponse(res, {
    status: 'ready',
    database: db.getStatus(),
    redis: redis.getStatus(),
  });
});

export const systemRouter = router;
