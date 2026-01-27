import { Router } from 'express';
import reconciliationController from '../controllers/reconciliation.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User.model';
import { validate } from '../middleware/validate.middleware';
import {
  updateReconciliationResultSchema,
  uploadJobIdSchema,
  reconciliationResultIdSchema,
} from '../validations/reconciliation.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get reconciliation results for an upload job
router.get(
  '/:uploadJobId/results',
  validate(uploadJobIdSchema, 'params'),
  reconciliationController.getReconciliationResults
);

// Get reconciliation statistics for an upload job
router.get(
  '/:uploadJobId/stats',
  validate(uploadJobIdSchema, 'params'),
  reconciliationController.getReconciliationStats
);

// Update reconciliation result (ANALYST and ADMIN only)
router.patch(
  '/:id',
  authorize(UserRole.ANALYST, UserRole.ADMIN),
  validate(reconciliationResultIdSchema, 'params'),
  validate(updateReconciliationResultSchema),
  reconciliationController.updateReconciliationResult
);

export default router;
