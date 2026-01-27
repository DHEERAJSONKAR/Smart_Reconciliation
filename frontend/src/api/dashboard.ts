import { apiClient } from './client';
import { DashboardSummary, DashboardFilter } from '@/types/dashboard';

export const dashboardApi = {
  getSummary: (filters?: DashboardFilter) =>
    apiClient.get<DashboardSummary>('/dashboard/summary', filters),
};
