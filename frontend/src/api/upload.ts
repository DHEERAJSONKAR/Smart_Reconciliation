import { apiClient } from './client';
import { UploadJob, UploadResponse } from '@/types/upload';
import { PaginatedResponse } from '@/types/api';

export const uploadApi = {
  upload: (formData: FormData) =>
    apiClient.uploadFile<UploadResponse>('/uploads', formData),

  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get<{ jobs: UploadJob[]; total: number; page: number; totalPages: number }>('/uploads', params),

  getById: (id: string) =>
    apiClient.get<UploadJob>(`/uploads/${id}`),
};
