import { apiClient } from './client';
import { AuthResponse, LoginCredentials } from '@/types/auth';

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<AuthResponse>('/auth/login', credentials),

  register: (data: { email: string; password: string; role: string }) =>
    apiClient.post<AuthResponse>('/auth/register', data),
};
