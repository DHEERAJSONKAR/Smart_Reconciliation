import { Router } from 'express';
import dashboardController from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get dashboard summary
router.get('/summary', dashboardController.getSummary);

// Get recent activity
router.get('/activity', dashboardController.getRecentActivity);

export default router;
