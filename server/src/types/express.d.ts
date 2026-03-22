import 'express';

declare global {
  namespace Express {
    interface Request {
      traceId?: string;
      _startTime?: [number, number];
      user?: {
        id: string;
        country: string;
        language: string;
      };
    }
  }
}

export {};
