import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    COMPLETED: 'bg-success-50 text-success-700 border-success-200',
    PROCESSING: 'bg-primary-50 text-primary-700 border-primary-200',
    PENDING: 'bg-gray-50 text-gray-700 border-gray-200',
    FAILED: 'bg-danger-50 text-danger-700 border-danger-200',
    MATCHED: 'bg-success-50 text-success-700 border-success-200',
    PARTIAL: 'bg-warning-50 text-warning-700 border-warning-200',
    UNMATCHED: 'bg-danger-50 text-danger-700 border-danger-200',
    DUPLICATE: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
};

export const getRoleColor = (role: string): string => {
  const colors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-800',
    ANALYST: 'bg-blue-100 text-blue-800',
    VIEWER: 'bg-gray-100 text-gray-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};
