// src/components/dashboard/StatusBadge.tsx
import React from 'react';

type StatusType = 'pending' | 'completed' | 'failed';

interface StatusBadgeProps {
  status: StatusType;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusClasses = (status: StatusType): string => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: StatusType): string => {
    switch (status) {
      case 'pending':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusClasses(status)}`}>
      {status === 'pending' && (
        <svg className="mr-1.5 h-2 w-2 text-blue-400 animate-pulse" fill="currentColor" viewBox="0 0 8 8">
          <circle cx="4" cy="4" r="3" />
        </svg>
      )}
      {status === 'completed' && (
        <svg className="mr-1.5 h-2 w-2 text-green-500" fill="currentColor" viewBox="0 0 8 8">
          <circle cx="4" cy="4" r="3" />
        </svg>
      )}
      {status === 'failed' && (
        <svg className="mr-1.5 h-2 w-2 text-red-500" fill="currentColor" viewBox="0 0 8 8">
          <circle cx="4" cy="4" r="3" />
        </svg>
      )}
      {getStatusText(status)}
    </span>
  );
}