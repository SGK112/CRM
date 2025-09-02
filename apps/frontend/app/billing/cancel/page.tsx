'use client';
import React from 'react';

export default function BillingCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-6">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-3xl font-semibold mb-4">Checkout Canceled</h1>
        <p className="text-slate-300 mb-6">
          No worries—your account hasn't been upgraded yet. Pick up where you left off anytime.
        </p>
        <a
          href="/billing/cart"
          className="inline-block rounded-md bg-amber-600 hover:bg-amber-500 px-6 py-3 text-sm font-semibold shadow shadow-amber-600/30 transition"
        >
          Return to Cart
        </a>
      </div>
    </div>
  );
}
