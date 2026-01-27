import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { UserRole } from '../models/User.model';

class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password) {
      return ApiResponse.badRequest(res, 'Email and password are required');
    }

    // Validate role if provided
    let userRole = UserRole.VIEWER;
    if (role) {
      if (!Object.values(UserRole).includes(role)) {
        return ApiResponse.badRequest(res, 'Invalid role provided');
      }
      userRole = role;
    }

    const result = await authService.register(email, password, userRole);

    return ApiResponse.created(res, result, 'User registered successfully');
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return ApiResponse.badRequest(res, 'Email and password are required');
    }

    const result = await authService.login(email, password);

    return ApiResponse.success(res, result, 'Login successful');
  });

  getProfile = asyncHandler(async (req: any, res: Response) => {
    const user = await authService.getUserById(req.user.userId);

    if (!user) {
      return ApiResponse.notFound(res, 'User not found');
    }

    return ApiResponse.success(res, {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    }, 'Profile retrieved successfully');
  });
}

export default new AuthController();
