import { apiClient } from './client';
import { AuditLog } from '@/types/audit';

export const auditApi = {
  getLogs: (params: { entityType: string; entityId?: string; limit?: number }) =>
    apiClient.get<{ logs: AuditLog[]; total: number }>('/audit/logs', params),
};
