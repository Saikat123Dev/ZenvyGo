import type { Response } from 'express';
import { HTTP_STATUS } from '../config/constants';

/**
 * Standard API response interface
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
  meta?: {
    timestamp: string;
    [key: string]: unknown;
  };
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Send success response
 */
export function successResponse<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK
): Response {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return res.status(statusCode).json(response);
}

/**
 * Send created response
 */
export function createdResponse<T>(
  res: Response,
  data?: T,
  message: string = 'Resource created successfully'
): Response {
  return successResponse(res, data, message, HTTP_STATUS.CREATED);
}

/**
 * Send no content response
 */
export function noContentResponse(res: Response): Response {
  return res.status(HTTP_STATUS.NO_CONTENT).send();
}

/**
 * Send error response
 */
export function errorResponse(
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errors?: unknown
): Response {
  const response: ApiResponse = {
    success: false,
    message,
    errors,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return res.status(statusCode).json(response);
}

/**
 * Send paginated response
 */
export function paginatedResponse<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message?: string
): Response {
  const totalPages = Math.ceil(total / limit);

  const response: PaginatedResponse<T> = {
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return res.status(HTTP_STATUS.OK).json(response);
}
