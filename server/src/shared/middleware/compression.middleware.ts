import compression from 'compression';
import { type Request, type Response } from 'express';

/**
 * Compression middleware using gzip/deflate
 * Significantly reduces response payload size for text-based responses
 */
export const compressionMiddleware = compression({
  // Only compress responses larger than 1KB
  threshold: 1024,

  // Compression level (0-9): 6 is a good balance between speed and compression ratio
  level: 6,

  // Custom filter function to determine which responses should be compressed
  filter: (req: Request, res: Response) => {
    // Don't compress if client doesn't accept encoding
    if (req.headers['x-no-compression']) {
      return false;
    }

    // Don't compress responses with Cache-Control: no-transform
    const cacheControl = res.getHeader('Cache-Control');
    if (cacheControl && String(cacheControl).includes('no-transform')) {
      return false;
    }

    // Don't compress server-sent events
    if (res.getHeader('Content-Type')?.toString().includes('text/event-stream')) {
      return false;
    }

    // Use compression module's default filter
    return compression.filter(req, res);
  },

  // Memory level (1-9): Amount of memory allocated for compression
  memLevel: 8,
});
