import React from 'react';

export const StatusBadge = ({ status = 'Received' }) => {
  const getStyle = (s) => {
    switch (s.toLowerCase()) {
      case 'received':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'sent':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'accepted':
      case 'completed':
      case 'active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'rejected':
      case 'expired':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'countered':
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${getStyle(
        status
      )}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {status}
    </span>
  );
};

export default StatusBadge;
