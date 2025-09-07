'use client';

import { useEffect } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    // In production, this would send to an error monitoring service
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load Profile
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We encountered an error while trying to load the client profile. This could be due to a temporary issue or invalid client data.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => reset()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Try Again
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Go Back
            </button>
          </div>
          
          {error?.digest && (
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
