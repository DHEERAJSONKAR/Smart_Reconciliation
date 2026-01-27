import { Request, Response, NextFunction } from 'express';
import { sanitizeObject } from '../utils/security';

/**
 * Middleware to sanitize all incoming request data
 */
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};
