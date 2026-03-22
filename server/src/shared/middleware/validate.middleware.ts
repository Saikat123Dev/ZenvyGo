import type { Request, RequestHandler } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { ValidationError } from '../utils/api-error';

export enum ValidationTarget {
  BODY = 'body',
  QUERY = 'query',
  PARAMS = 'params',
  HEADERS = 'headers',
}

interface ValidationOptions {
  target?: ValidationTarget;
}

export function validate(schema: ZodSchema, options: ValidationOptions = {}): RequestHandler {
  const target = options.target ?? ValidationTarget.BODY;

  return (req, _res, next) => {
    try {
      const validated = schema.parse(getValidationData(req, target));
      setValidationData(req, target, validated);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError('Validation failed', formatZodErrors(error)));
        return;
      }

      next(error);
    }
  };
}

export function validateBody(schema: ZodSchema): RequestHandler {
  return validate(schema, { target: ValidationTarget.BODY });
}

export function validateQuery(schema: ZodSchema): RequestHandler {
  return validate(schema, { target: ValidationTarget.QUERY });
}

export function validateParams(schema: ZodSchema): RequestHandler {
  return validate(schema, { target: ValidationTarget.PARAMS });
}

function getValidationData(req: Request, target: ValidationTarget): unknown {
  switch (target) {
    case ValidationTarget.BODY:
      return req.body;
    case ValidationTarget.QUERY:
      return req.query;
    case ValidationTarget.PARAMS:
      return req.params;
    case ValidationTarget.HEADERS:
      return req.headers;
  }
}

function setValidationData(req: Request, target: ValidationTarget, data: unknown): void {
  switch (target) {
    case ValidationTarget.BODY:
      req.body = data;
      return;
    case ValidationTarget.QUERY:
      req.query = data as Request['query'];
      return;
    case ValidationTarget.PARAMS:
      req.params = data as Request['params'];
      return;
    case ValidationTarget.HEADERS:
      return;
  }
}

function formatZodErrors(error: ZodError): Array<Record<string, string | undefined>> {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));
}
