import { Response } from 'express';

export interface ApiResponseData {
  success: boolean;
  message?: string;
  data?: any;
  error?: any;
  meta?: any;
}

export class ApiResponse {
  static success(res: Response, data: any = null, message: string = 'Success', statusCode: number = 200, meta?: any): Response {
    const response: ApiResponseData = {
      success: true,
      message,
      data,
    };

    if (meta) {
      response.meta = meta;
    }

    return res.status(statusCode).json(response);
  }

  static error(res: Response, message: string = 'Error', statusCode: number = 500, error?: any): Response {
    const response: ApiResponseData = {
      success: false,
      message,
    };

    if (error) {
      response.error = error;
    }

    return res.status(statusCode).json(response);
  }

  static created(res: Response, data: any = null, message: string = 'Created successfully'): Response {
    return ApiResponse.success(res, data, message, 201);
  }

  static badRequest(res: Response, message: string = 'Bad request', error?: any): Response {
    return ApiResponse.error(res, message, 400, error);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return ApiResponse.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return ApiResponse.error(res, message, 403);
  }

  static notFound(res: Response, message: string = 'Resource not found'): Response {
    return ApiResponse.error(res, message, 404);
  }

  static conflict(res: Response, message: string = 'Conflict', error?: any): Response {
    return ApiResponse.error(res, message, 409, error);
  }

  static internalError(res: Response, message: string = 'Internal server error', error?: any): Response {
    return ApiResponse.error(res, message, 500, error);
  }
}
