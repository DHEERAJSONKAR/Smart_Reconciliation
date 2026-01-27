import { apiClient } from './client';
import { ReconciliationResult, ReconciliationFilter } from '@/types/reconciliation';

export const reconciliationApi = {
  getByUploadJob: (uploadJobId: string, filters?: ReconciliationFilter) =>
    apiClient.get<{ results: ReconciliationResult[]; total: number }>('/reconciliation', {
      uploadJobId,
      ...filters,
    }),

  updateResult: (id: string, data: Partial<ReconciliationResult>) =>
    apiClient.patch<ReconciliationResult>(`/reconciliation/${id}`, data),
};
