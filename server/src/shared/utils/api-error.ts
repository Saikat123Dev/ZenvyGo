import { HTTP_STATUS } from '../config/constants';

/**
 * Base API Error class
 * All custom errors should extend this class
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: unknown;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    errors?: unknown
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request
 * Malformed request syntax, invalid request message framing
 */
export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad Request', errors?: unknown) {
    super(message, HTTP_STATUS.BAD_REQUEST, true, errors);
  }
}

/**
 * 401 Unauthorized
 * Authentication is required and has failed or has not been provided
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, HTTP_STATUS.UNAUTHORIZED, true);
  }
}

/**
 * 403 Forbidden
 * User does not have permission to access the resource
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(message, HTTP_STATUS.FORBIDDEN, true);
  }
}

/**
 * 404 Not Found
 * Requested resource could not be found
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND, true);
  }
}

/**
 * 409 Conflict
 * Request conflicts with current state of the server
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Conflict') {
    super(message, HTTP_STATUS.CONFLICT, true);
  }
}

/**
 * 422 Unprocessable Entity
 * Validation errors
 */
export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed', errors?: unknown) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, true, errors);
  }
}

/**
 * 429 Too Many Requests
 * Rate limit exceeded
 */
export class RateLimitError extends ApiError {
  constructor(message: string = 'Too many requests, please try again later') {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, true);
  }
}

/**
 * 500 Internal Server Error
 * Generic server error
 */
export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, false);
  }
}

/**
 * 503 Service Unavailable
 * Service temporarily unavailable
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, HTTP_STATUS.SERVICE_UNAVAILABLE, true);
  }
}

/**
 * Helper to check if error is operational (known error vs programmer error)
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof ApiError) {
    return error.isOperational;
  }
  return false;
}
