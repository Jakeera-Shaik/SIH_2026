import React from 'react';

export const StatusBadge = ({ status = 'Received' }) => {
  const getStyle = (s) => {
    switch (s.toLowerCase()) {
      case 'received':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'sent':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'accepted':
      case 'completed':
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
      case 'expired':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'countered':
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${getStyle(
        status
      )}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {status}
    </span>
  );
};

export default StatusBadge;
