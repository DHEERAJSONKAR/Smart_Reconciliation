import { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth.middleware';
import reconciliationService from '../services/reconciliation.service';
import uploadService from '../services/upload.service';
import { ReconciliationStatus } from '../models/ReconciliationResult.model';
import auditService from '../services/audit.service';

class ReconciliationController {
  getReconciliationResults = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { uploadJobId } = req.params;
    const { status, manuallyReviewed } = req.query;

    const filters: any = {};

    if (status) {
      filters.status = status as ReconciliationStatus;
    }

    if (manuallyReviewed !== undefined) {
      filters.manuallyReviewed = manuallyReviewed === 'true';
    }

    const results = await reconciliationService.getReconciliationResults(
      uploadJobId,
      filters
    );

    return ApiResponse.success(
      res,
      results,
      'Reconciliation results retrieved successfully'
    );
  });

  getReconciliationStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { uploadJobId } = req.params;

    const stats = await reconciliationService.getReconciliationStats(uploadJobId);

    return ApiResponse.success(
      res,
      stats,
      'Reconciliation statistics retrieved successfully'
    );
  });

  updateReconciliationResult = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user!.userId;

    // Validate status if provided
    if (status && !Object.values(ReconciliationStatus).includes(status)) {
      return ApiResponse.badRequest(res, 'Invalid reconciliation status');
    }

    // Get old value for audit
    const oldResult = await reconciliationService.getReconciliationResults('', {});
    const oldValue = oldResult.find((r: any) => r._id.toString() === id);

    const result = await reconciliationService.updateReconciliationResult(id, userId, {
      status,
      notes,
    });

    if (!result) {
      return ApiResponse.notFound(res, 'Reconciliation result not found');
    }

    // Log audit trail
    await auditService.logReview(
      'ReconciliationResult',
      id,
      oldValue ? { status: oldValue.status, notes: oldValue.notes } : {},
      { status: result.status, notes: result.notes },
      userId,
      'API',
      {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      }
    );

    return ApiResponse.success(
      res,
      result,
      'Reconciliation result updated successfully'
    );
  });
}

export default new ReconciliationController();
