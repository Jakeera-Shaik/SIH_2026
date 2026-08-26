import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const ErrorState = ({ message = 'Failed to load data from server.', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-950/30 border border-red-800/50 rounded-2xl text-center">
      <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
      <h4 className="text-base font-semibold text-red-200 mb-1">Something went wrong</h4>
      <p className="text-sm text-red-300/80 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-red-900/60 hover:bg-red-900 text-red-100 text-xs font-semibold px-4 py-2 rounded-lg transition-colors border border-red-700/50"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
