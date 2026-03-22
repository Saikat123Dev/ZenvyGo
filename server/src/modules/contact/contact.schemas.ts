import { z } from 'zod';
import { SESSION } from '../../shared/config/constants';

export const contactSessionIdParamsSchema = z.object({
  sessionId: z.string().uuid(),
});

export const createPublicContactSessionSchema = z.object({
  token: z.string().trim().min(16).max(128),
  reasonCode: z.enum(SESSION.REASON_CODES),
  requestedChannel: z.enum(SESSION.CHANNELS),
  requesterName: z.string().trim().min(1).max(100).optional().nullable(),
  message: z.string().trim().min(1).max(SESSION.MAX_MESSAGE_LENGTH).optional().nullable(),
});
