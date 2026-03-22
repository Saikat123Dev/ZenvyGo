import helmet from 'helmet';
import { isDevelopment, isProduction } from '../config/env';

export const helmetMiddleware = helmet({
  contentSecurityPolicy: isDevelopment
    ? false
    : {
        directives: {
          defaultSrc: ["'self'"],
          frameAncestors: ["'none'"],
          objectSrc: ["'none'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
        },
      },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  frameguard: { action: 'deny' },
  hsts: isProduction
    ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      }
    : false,
  hidePoweredBy: true,
  noSniff: true,
  originAgentCluster: true,
  referrerPolicy: { policy: 'no-referrer' },
});

export const publicSecurityMiddleware = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  noSniff: true,
});
