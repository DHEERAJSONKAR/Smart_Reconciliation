import AuditLog, { AuditAction, IAuditLog } from '../models/AuditLog.model';
import logger from '../utils/logger';

export interface AuditLogData {
  entityType: string;
  entityId: string;
  action: AuditAction;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  changedBy: string;
  source: string;
  ipAddress?: string;
  userAgent?: string;
}

class AuditService {
  async log(data: AuditLogData): Promise<IAuditLog> {
    try {
      const auditLog = await AuditLog.create({
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        oldValue: data.oldValue,
        newValue: data.newValue,
        changedBy: data.changedBy,
        source: data.source,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        timestamp: new Date(),
      });

      logger.info(`Audit log created: ${data.action} on ${data.entityType} ${data.entityId} by ${data.changedBy}`);
      return auditLog;
    } catch (error) {
      logger.error('Failed to create audit log:', error);
      throw error;
    }
  }

  async logCreate(
    entityType: string,
    entityId: string,
    newValue: Record<string, any>,
    changedBy: string,
    source: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<IAuditLog> {
    return this.log({
      entityType,
      entityId,
      action: AuditAction.CREATE,
      newValue,
      changedBy,
      source,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  async logUpdate(
    entityType: string,
    entityId: string,
    oldValue: Record<string, any>,
    newValue: Record<string, any>,
    changedBy: string,
    source: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<IAuditLog> {
    return this.log({
      entityType,
      entityId,
      action: AuditAction.UPDATE,
      oldValue,
      newValue,
      changedBy,
      source,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  async logReconcile(
    entityType: string,
    entityId: string,
    reconciliationData: Record<string, any>,
    changedBy: string,
    source: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<IAuditLog> {
    return this.log({
      entityType,
      entityId,
      action: AuditAction.RECONCILE,
      newValue: reconciliationData,
      changedBy,
      source,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  async logReview(
    entityType: string,
    entityId: string,
    oldValue: Record<string, any>,
    newValue: Record<string, any>,
    changedBy: string,
    source: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<IAuditLog> {
    return this.log({
      entityType,
      entityId,
      action: AuditAction.REVIEW,
      oldValue,
      newValue,
      changedBy,
      source,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  async getAuditLogs(
    filters: {
      entityType?: string;
      entityId?: string;
      changedBy?: string;
      action?: AuditAction;
      startDate?: Date;
      endDate?: Date;
    } = {},
    page: number = 1,
    limit: number = 50
  ): Promise<{
    logs: IAuditLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query: any = {};

    if (filters.entityType) {
      query.entityType = filters.entityType;
    }

    if (filters.entityId) {
      query.entityId = filters.entityId;
    }

    if (filters.changedBy) {
      query.changedBy = filters.changedBy;
    }

    if (filters.action) {
      query.action = filters.action;
    }

    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) {
        query.timestamp.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.timestamp.$lte = filters.endDate;
      }
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('changedBy', 'email role')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(query),
    ]);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAuditLogsForEntity(
    entityType: string,
    entityId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    logs: IAuditLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.getAuditLogs({ entityType, entityId }, page, limit);
  }

  async getAuditHistory(
    entityType: string,
    entityId: string
  ): Promise<IAuditLog[]> {
    return AuditLog.find({ entityType, entityId })
      .populate('changedBy', 'email role')
      .sort({ timestamp: 1 });
  }
}

export default new AuditService();
