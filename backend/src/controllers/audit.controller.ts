import { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth.middleware';
import auditService from '../services/audit.service';

class AuditController {
  getAuditLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      entityType,
      entityId,
      changedBy,
      action,
      startDate,
      endDate,
      page = '1',
      limit = '50',
    } = req.query;

    const filters: any = {};

    if (entityType) {
      filters.entityType = entityType as string;
    }

    if (entityId) {
      filters.entityId = entityId as string;
    }

    if (changedBy) {
      filters.changedBy = changedBy as string;
    }

    if (action) {
      filters.action = action;
    }

    if (startDate) {
      filters.startDate = new Date(startDate as string);
    }

    if (endDate) {
      filters.endDate = new Date(endDate as string);
    }

    const result = await auditService.getAuditLogs(
      filters,
      parseInt(page as string, 10),
      parseInt(limit as string, 10)
    );

    return ApiResponse.success(res, result, 'Audit logs retrieved successfully');
  });

  getAuditLogsForEntity = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { entityId } = req.params;
    const { entityType, page = '1', limit = '50' } = req.query;

    if (!entityType) {
      return ApiResponse.badRequest(res, 'Entity type is required');
    }

    const result = await auditService.getAuditLogsForEntity(
      entityType as string,
      entityId,
      parseInt(page as string, 10),
      parseInt(limit as string, 10)
    );

    return ApiResponse.success(
      res,
      result,
      'Audit logs for entity retrieved successfully'
    );
  });

  getAuditHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { entityId } = req.params;
    const { entityType } = req.query;

    if (!entityType) {
      return ApiResponse.badRequest(res, 'Entity type is required');
    }

    const history = await auditService.getAuditHistory(
      entityType as string,
      entityId
    );

    return ApiResponse.success(
      res,
      history,
      'Audit history retrieved successfully'
    );
  });
}

export default new AuditController();
