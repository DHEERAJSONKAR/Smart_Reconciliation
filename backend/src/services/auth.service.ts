import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import config from '../config';
import User, { IUser, UserRole } from '../models/User.model';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
  token: string;
}

class AuthService {
  generateToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: config.jwt.expiresIn as StringValue | number,
    };
    return jwt.sign(payload, config.jwt.secret, options);
  }

  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as TokenPayload;
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }

  async register(email: string, password: string, role: UserRole = UserRole.VIEWER): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User already exists with this email', 409);
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      role,
    });

    logger.info(`New user registered: ${email} with role ${role}`);

    // Generate token
    const token = this.generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    logger.info(`User logged in: ${email}`);

    // Generate token
    const token = this.generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async getUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }
}

export default new AuthService();
