import type { Request, Response, NextFunction } from 'express';

/**
 * Type for async route handlers
 */
export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

/**
 * Wrapper for async route handlers
 * Catches errors and forwards them to error handling middleware
 *
 * Usage:
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await userService.getAll();
 *   return successResponse(res, users);
 * }));
 */
export function asyncHandler(fn: AsyncRequestHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Wrapper for async middleware
 */
export function asyncMiddleware(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
