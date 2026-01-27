import { Router } from 'express';
import auditController from '../controllers/audit.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User.model';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get audit logs with filters (ADMIN only)
router.get(
  '/',
  authorize(UserRole.ADMIN),
  auditController.getAuditLogs
);

// Get audit logs for specific entity
router.get(
  '/:entityId',
  auditController.getAuditLogsForEntity
);

// Get audit history for specific entity
router.get(
  '/:entityId/history',
  auditController.getAuditHistory
);

export default router;
