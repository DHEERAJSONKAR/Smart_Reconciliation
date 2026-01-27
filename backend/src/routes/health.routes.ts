import { Router, Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import mongoose from 'mongoose';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  const health = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  };

  ApiResponse.success(res, health, 'System is healthy');
});

export default router;
