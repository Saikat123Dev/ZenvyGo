import type { NextFunction, Request, Response } from 'express';
import { log } from '../utils/logger';

export function addTraceId(req: Request, res: Response, next: NextFunction): void {
  const incomingTraceId = req.headers['x-trace-id'];
  const traceId =
    typeof incomingTraceId === 'string'
      ? incomingTraceId
      : `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  req.traceId = traceId;
  req._startTime = process.hrtime();
  res.set('X-Trace-ID', traceId);

  next();
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    if (req.path === '/health') {
      return;
    }

    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    log.http(`${req.method} ${req.originalUrl}`, {
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      traceId: req.traceId,
      userId: req.user?.id,
      ip: req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
  });

  next();
}
