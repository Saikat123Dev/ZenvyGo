import type { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '../config/constants';
import { isDevelopment } from '../config/env';
import { ApiError, isOperationalError } from '../utils/api-error';
import { errorResponse } from '../utils/api-response';
import { log } from '../utils/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  const traceId = req.traceId ?? String(Date.now());
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';
  let errors: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Token expired';
  } else if (err.name === 'ZodError') {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    message = 'Validation failed';
    errors = (err as Error & { issues?: unknown }).issues;
  } else if (isDevelopment || isOperationalError(err)) {
    message = err.message;
  }

  log.error('Request failed', err, {
    traceId,
    statusCode,
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id,
  });

  res.set('X-Trace-ID', traceId);
  errorResponse(res, message, statusCode, errors);
}

export function notFoundHandler(req: Request, res: Response): void {
  errorResponse(
    res,
    `Route ${req.method} ${req.originalUrl} not found`,
    HTTP_STATUS.NOT_FOUND,
  );
}
