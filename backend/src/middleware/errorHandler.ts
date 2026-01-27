import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { ApiResponse } from '../utils/apiResponse';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = err as AppError;
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  ApiResponse.error(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
  );
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  ApiResponse.notFound(res, `Route ${req.originalUrl} not found`);
};
