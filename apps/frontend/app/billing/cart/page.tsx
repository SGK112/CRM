'use client';
import { useState } from 'react';

interface PlanOption {
  id: string; // Stripe price ID
  name: string;
  description: string;
  price: string; // formatted
  priceId: string;
  interval: string;
  trialDays: number;
  features: string[];
}

const PLANS: PlanOption[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Core CRM + basic project tracking',
    price: '$49',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || 'price_starter_placeholder',
    interval: 'mo',
    trialDays: 14,
    features: ['Up to 5 team members', 'Projects & Clients', 'Basic dashboards'],
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Automation + advanced analytics',
    price: '$149',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH || 'price_growth_placeholder',
    interval: 'mo',
    trialDays: 14,
    features: ['Unlimited team', 'Automations', 'Advanced analytics', 'Priority support'],
  },
];

export default function BillingCartPage({
  searchParams,
}: {
  searchParams: { plan?: string; email?: string; workspace?: string };
}) {
  const selected = PLANS.find(p => p.id === searchParams.plan) || PLANS[0];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/billing/create-checkout-session`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId: selected.priceId,
            customerEmail: searchParams.email,
            workspaceName: searchParams.workspace,
          }),
        }
      );
      if (!res.ok) throw new Error('Failed to create checkout session');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Missing checkout redirect URL');
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-6">
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Checkout</h1>
          <p className="text-slate-400 text-sm mb-6">
            Start your {selected.trialDays}-day free trial. You can cancel anytime before the trial
            ends.
          </p>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-1">Plan Details</h2>
            <p className="text-slate-400 text-sm mb-4">
              {selected.name} – {selected.description}
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              {selected.features.map(f => (
                <li key={f} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-lg font-semibold mb-4">Billing Summary</h3>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Subscription</span>
              <span>
                {selected.price}/{selected.interval}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Trial Period</span>
              <span>{selected.trialDays} days</span>
            </div>
            <div className="border-t border-slate-800 my-4" />
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Due Today</span>
              <span className="text-emerald-400">$0.00</span>
            </div>
            {error && (
              <div className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/40 px-3 py-2 rounded-md">
                {error}
              </div>
            )}
            <button
              onClick={startCheckout}
              disabled={loading}
              className="mt-6 w-full rounded-md bg-amber-600 hover:bg-amber-500 disabled:opacity-50 px-5 py-3 text-sm font-semibold shadow shadow-amber-600/30 transition"
            >
              {loading ? 'Redirecting...' : `Start Trial`}
            </button>
            <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
              By starting your trial you agree to our{' '}
              <a href="/terms" className="text-amber-400 hover:text-amber-300">
                Terms
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-amber-400 hover:text-amber-300">
                Privacy Policy
              </a>
              . We'll email you before the trial ends.
            </p>
          </div>
        </div>
        <aside className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-slate-300 uppercase">
            Switch Plan
          </h2>
          <div className="space-y-3">
            {PLANS.map(p => (
              <a
                key={p.id}
                href={`/billing/cart?plan=${p.id}`}
                className={`block rounded-md border px-4 py-3 text-sm transition ${p.id === selected.id ? 'border-amber-500/60 bg-amber-500/10' : 'border-slate-700 hover:border-amber-500/40 bg-slate-800/40 hover:bg-slate-800/60'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-slate-400">
                    {p.price}/{p.interval}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
