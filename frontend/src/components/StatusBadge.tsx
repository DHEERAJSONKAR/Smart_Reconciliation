import React from 'react';
import { getStatusColor } from '@/utils/helpers';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${sizeClasses[size]} ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};
