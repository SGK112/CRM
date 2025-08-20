'use client';
import React from 'react';
import Link from 'next/link';
import { useSubscription } from './subscription-context';

function Badge() {
  const { plan, status, trialEndsAt, loading } = useSubscription();
  if (loading) return <span className="text-[10px] text-slate-500">...</span>;
  if (!status) return <Link href="/billing/cart" className="text-[10px] font-medium px-2 py-1 rounded bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30 transition">Start Trial</Link>;
  const trial = status?.toLowerCase().includes('trial');
  return (
    <div className="flex items-center gap-2">
      <span className={`text-[10px] font-medium px-2 py-1 rounded border ${trial ? 'bg-amber-600/20 text-amber-300 border-amber-500/40' : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30'}`}>{plan || 'Free'}</span>
      {trial && trialEndsAt && <span className="text-[10px] text-slate-400">Ends {new Date(trialEndsAt).toLocaleDateString()}</span>}
    </div>
  );
}

export function TopBar() {
  return (
    <div className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
      <div className="mx-auto flex h-12 items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-100">
          <span className="h-7 w-7 rounded-md bg-amber-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner ring-1 ring-amber-400/40">RC</span>
          <span>Remodely</span>
        </Link>
        <nav className="flex items-center gap-4 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-amber-300">Dashboard</Link>
          <Link href="/clients" className="hover:text-amber-300">Clients</Link>
          <Link href="/projects" className="hover:text-amber-300">Projects</Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/auth/login" className="text-xs font-medium text-slate-400 hover:text-slate-200 transition">Sign In</Link>
          <Badge />
        </div>
      </div>
    </div>
  );
}
