'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 max-w-md w-full">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Something went wrong!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          An error occurred while loading the contact profile.
        </p>
        <button
          onClick={reset}
          className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
