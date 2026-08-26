import React from 'react';
import { Inbox, RotateCcw } from 'lucide-react';

export const EmptyState = ({ title = 'No results found', description = 'Try adjusting your search query or filters.', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
      <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
        <Inbox className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Filters
        </button>
      )}
    </div>
  );
};

export default EmptyState;
