'use client'

import Link from 'next/link'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <html>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <div className="max-w-xl mx-auto py-16 px-6">
          <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-sm text-[var(--text-dim)] mb-4">An unexpected error occurred. You can try again or return home.</p>
          {error?.message && (
            <pre className="text-xs whitespace-pre-wrap bg-[var(--surface-2)] border border-[var(--border)] rounded-md p-3 mb-4 overflow-auto">
              {error.message}
            </pre>
          )}
          {error?.digest && (
            <p className="text-xs text-[var(--text-faint)] mb-4">Ref: {error.digest}</p>
          )}
          <div className="flex gap-3">
            <button onClick={reset} className="btn btn-amber">Try again</button>
            <Link href="/" className="btn btn-outline">Go home</Link>
          </div>
        </div>
      </body>
    </html>
  )
}
