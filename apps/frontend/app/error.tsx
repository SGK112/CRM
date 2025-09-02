'use client';
import { useEffect } from 'react';
import Link from 'next/link';

// Global route-level error boundary for App Router pages
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Could hook into a logging service here
    // eslint-disable-next-line no-console
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center bg-[var(--bg)]">
      <div className="relative mb-8">
        <div className="absolute -inset-4 rounded-2xl bg-amber-600/10 blur-xl" />
        <div className="relative mx-auto h-20 w-20 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shadow-lg ring-1 ring-[var(--border)]">
          <span className="text-amber-400 font-bold text-2xl">!</span>
        </div>
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--text)] mb-3">
        Something went wrong
      </h1>
      <p className="text-[var(--text-dim)] text-sm max-w-md mb-6">
        An unexpected error occurred while loading this page. You can try again or return to the
        dashboard.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-md bg-amber-600 hover:bg-amber-500 px-5 py-2.5 text-sm font-medium text-white shadow shadow-amber-600/30 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60"
        >
          Retry
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-[var(--border)] hover:border-amber-500/60 px-5 py-2.5 text-sm font-medium text-[var(--text-dim)] hover:text-amber-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60"
        >
          Go Home
        </Link>
      </div>
      {error?.digest && (
        <p className="mt-6 text-[10px] uppercase tracking-wide text-[var(--text-faint)]">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
