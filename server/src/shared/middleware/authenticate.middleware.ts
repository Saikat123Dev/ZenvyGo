import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/api-error';
import { env } from '../config/env';

interface JwtPayload {
  sub: string;
  country: string;
  language: string;
  type: 'access';
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing bearer token');
    }

    const token = header.slice('Bearer '.length);
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    if (payload.type !== 'access') {
      throw new UnauthorizedError('Invalid access token');
    }

    req.user = {
      id: payload.sub,
      country: payload.country,
      language: payload.language,
    };

    next();
  } catch (error) {
    next(error);
  }
}
