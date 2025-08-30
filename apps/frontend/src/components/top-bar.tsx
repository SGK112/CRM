'use client';
import React from 'react';
import Link from 'next/link';
import { useSubscription } from './subscription-context';
import ThemeToggle from './ThemeToggle';

function Badge() {
  const { plan, status, trialEndsAt, loading } = useSubscription();
  if (loading) return <span className="text-[10px] text-tertiary">...</span>;
  if (!status) return (
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
      <span className={`text-[10px] font-medium px-2 py-1 rounded border ${trial ? 'bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-500/40' : 'bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'}`}>{plan || 'Free'}</span>
      {trial && trialEndsAt && <span className="text-[10px] text-secondary">Ends {new Date(trialEndsAt).toLocaleDateString()}</span>}
    </div>
  );
}

export function TopBar() {
  return (
    <div className="sticky top-0 z-40 w-full border-b border-token surface-1/80 backdrop-blur supports-[backdrop-filter]:surface-1/60">
      <div className="mx-auto flex h-12 items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-primary">
          <span className="h-7 w-7 rounded-md bg-amber-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner ring-1 ring-amber-400/40">RA</span>
          <span>Remodely Ai</span>
        </Link>
        <nav className="flex items-center gap-4 text-xs text-secondary">
          <Link href="/dashboard" className="hover:text-amber-500 transition-colors">Dashboard</Link>
          <Link href="/dashboard/clients" className="hover:text-amber-500 transition-colors">Clients</Link>
          <Link href="/dashboard/projects" className="hover:text-amber-500 transition-colors">Projects</Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle variant="button" />
          <Link href="/auth/login" className="text-xs font-medium text-secondary hover:text-primary transition">Sign In</Link>
          <Badge />
        </div>
      </div>
    </div>
  );
}
