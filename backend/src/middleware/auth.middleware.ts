import { Request, Response, NextFunction } from 'express';
import authService, { TokenPayload } from '../services/auth.service';
import { AppError } from './errorHandler';
import { UserRole } from '../models/User.model';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = authService.verifyToken(token);

    // Verify user still exists and is active
    const user = await authService.getUserById(decoded.userId);
    if (!user || !user.isActive) {
      throw new AppError('User no longer exists or is inactive', 401);
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        403
      );
    }

    next();
  };
};
