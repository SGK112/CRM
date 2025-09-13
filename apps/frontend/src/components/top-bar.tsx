'use client';
import Link from 'next/link';
import React from 'react';
import { useSubscription } from './subscription-context';

function Badge() {
  const { plan, status, trialEndsAt, loading } = useSubscription();
  if (loading) return <span className="text-[10px] text-tertiary">...</span>;
  if (!status)
    return (
      <Link
        href="/billing/cart"
        className="text-[10px] font-semibold px-3 py-1.5 rounded-md bg-amber-600 text-white border border-amber-600 hover:bg-amber-700 hover:border-amber-700 transition-all duration-200 shadow-sm"
      >
        Start Trial
      </Link>
    );
  const trial = status?.toLowerCase().includes('trial');
  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-[10px] font-medium px-2 py-1 rounded border ${trial ? 'bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-500/40' : 'bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'}`}
      >
        {plan || 'Free'}
      </span>
      {trial && trialEndsAt && (
        <span className="text-[10px] text-secondary">
          Ends {new Date(trialEndsAt).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}

export function TopBar() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="sticky top-0 z-40 w-full border-b border-token surface-1/80 backdrop-blur supports-[backdrop-filter]:surface-1/60">
      <div className="mx-auto flex items-center gap-4 px-4 py-2">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-primary"
          >
            <span className="h-8 w-8 rounded-md bg-amber-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner ring-1 ring-amber-400/40">
              RA
            </span>
            <span className="hidden sm:inline">Remodely Ai</span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4 text-xs text-secondary">
          <Link href="/dashboard" className="hover:text-amber-500 transition-colors">
            Dashboard
          </Link>
          <Link href="/dashboard/contacts" className="hover:text-amber-500 transition-colors">
            Contacts
          </Link>
          <Link href="/dashboard/projects" className="hover:text-amber-500 transition-colors">
            Projects
          </Link>
        </nav>

        {/* Mobile menu button */}
        <div className="ml-auto flex items-center gap-3 md:hidden">
          <button
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="p-2 rounded-md text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              {open ? (
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Desktop utilities */}
        <div className="hidden md:flex ml-auto items-center gap-4">
          <Link
            href="/auth/login"
            className="text-xs font-medium text-secondary hover:text-primary transition"
          >
            Sign In
          </Link>
          <Badge />
        </div>
      </div>

      {/* Mobile stacked menu (revealed by hamburger) */}
      {open && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg)]">
          <div className="flex flex-col px-4 py-3 text-sm text-secondary">
            <Link href="/dashboard" className="py-2 border-b border-transparent hover:border-[var(--border)]">Dashboard</Link>
            <Link href="/dashboard/contacts" className="py-2 border-b border-transparent hover:border-[var(--border)]">Contacts</Link>
            <Link href="/dashboard/projects" className="py-2 border-b border-transparent hover:border-[var(--border)]">Projects</Link>
            <Link href="/auth/login" className="py-2 text-xs font-medium text-secondary hover:text-primary">Sign In</Link>
            <div className="py-2"><Badge /></div>
          </div>
        </div>
      )}
    </div>
  );
}
