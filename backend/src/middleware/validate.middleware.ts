import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { ApiResponse } from '../utils/apiResponse';

export const validate = (schema: Schema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return ApiResponse.badRequest(res, errorMessage, {
        details: error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }

    // Replace request data with validated data
    req[property] = value;
    next();
  };
};
