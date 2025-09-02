'use client';
import React, { useEffect, useState } from 'react';

interface SessionDetails {
  id: string;
  status: string | null;
  payment_status: string | null;
  customer_email?: string | null;
  subscription?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  trial_end?: number | null;
}

export default function BillingSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [status, setStatus] = useState<'loading' | 'verified' | 'error'>('loading');

  useEffect(() => {
    const run = async () => {
      if (!searchParams.session_id) {
        setStatus('error');
        return;
      }
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/billing/session?id=${searchParams.session_id}`,
          { cache: 'no-store' }
        );
        if (!res.ok) throw new Error('Failed to load session');
        const data = await res.json();
        setSession(data);
        setStatus('verified');
      } catch (e) {
        setStatus('error');
      }
    };
    run();
  }, [searchParams.session_id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-6">
      <div className="max-w-lg w-full text-center">
        {status === 'loading' && (
          <p className="text-slate-400 text-sm">Finalizing your subscription...</p>
        )}
        {status === 'verified' && session && (
          <>
            <h1 className="text-3xl font-semibold mb-4">You're In! 🎉</h1>
            <p className="text-slate-300 mb-2">
              Trial started for <span className="text-amber-400">{session.customer_email}</span>
            </p>
            <p className="text-slate-500 text-sm mb-6">Session: {session.id}</p>
            <div className="mx-auto max-w-md text-left bg-slate-900/60 border border-slate-800 rounded-lg p-5 mb-6 text-sm">
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-slate-400">Status</dt>
                  <dd className="text-slate-200 capitalize">{session.status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Payment</dt>
                  <dd className="text-slate-200 capitalize">{session.payment_status}</dd>
                </div>
                {session.subscription && (
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Subscription</dt>
                    <dd className="text-slate-200">{session.subscription}</dd>
                  </div>
                )}
                {session.trial_end && (
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Trial Ends</dt>
                    <dd className="text-slate-200">
                      {new Date(session.trial_end * 1000).toLocaleDateString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
            <a
              href="/dashboard"
              className="inline-block rounded-md bg-amber-600 hover:bg-amber-500 px-6 py-3 text-sm font-semibold shadow shadow-amber-600/30 transition"
            >
              Go to Dashboard
            </a>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-2xl font-semibold mb-4">Missing Session</h1>
            <p className="text-slate-400 mb-6">
              We couldn't verify your checkout session. If you were charged, contact support.
            </p>
            <a
              href="/billing/cart"
              className="inline-block rounded-md bg-slate-700 hover:bg-slate-600 px-6 py-3 text-sm font-semibold transition"
            >
              Return to Cart
            </a>
          </>
        )}
      </div>
    </div>
  );
}
