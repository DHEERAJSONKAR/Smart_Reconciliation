export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  RECONCILE = 'RECONCILE',
  REVIEW = 'REVIEW',
}

export interface AuditLog {
  _id: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  changedBy: {
    _id: string;
    email: string;
  };
  source: string;
  ipAddress?: string;
  timestamp: string;
  createdAt: string;
}
