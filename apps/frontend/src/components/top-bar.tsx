'use client';
import React from 'react';
import Link from 'next/link';
import { useSubscription } from './subscription-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

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
  const router = useRouter();
  const params = useSearchParams();
  const initialQ = params.get('q') || '';
  const [q,setQ] = useState(initialQ);
  useEffect(()=> { setQ(initialQ); }, [initialQ]);

  const submit = (e:React.FormEvent) => {
    e.preventDefault();
    const qs = q.trim();
    if(!qs) { router.push('/search'); return; }
    router.push(`/search?q=${encodeURIComponent(qs)}`);
  };
  return (
    <div className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
      <div className="mx-auto flex h-14 items-center gap-4 px-4 max-w-7xl">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-100 group">
          <span className="h-8 w-8 rounded-md bg-amber-600 flex items-center justify-center text-[11px] font-bold text-white shadow-inner ring-1 ring-amber-400/40 group-hover:scale-[1.03] transition">RC</span>
          <span className="hidden sm:inline">Remodely</span>
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-400">
          <Link href="/features" className="hover:text-amber-300">Features</Link>
          <Link href="/pricing" className="hover:text-amber-300">Pricing</Link>
          <Link href="/integrations" className="hover:text-amber-300">Integrations</Link>
          <Link href="/docs" className="hover:text-amber-300">Docs</Link>
          <Link href="/dashboard" className="hover:text-amber-300">Dashboard</Link>
        </nav>
        <form onSubmit={submit} className="flex-1 flex items-center max-w-md ml-auto">
          <div className="relative w-full">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search clients, vendors, docs..." className="input pl-8 h-9 text-xs bg-slate-900/70 border-slate-700 focus:border-amber-500/60 focus:ring-amber-500/30" />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">⌕</span>
          </div>
        </form>
        <div className="hidden sm:flex items-center gap-4">
          <Link href="/auth/login" className="text-xs font-medium text-slate-400 hover:text-slate-200 transition">Sign In</Link>
          <Badge />
        </div>
      </div>
    </div>
  );
}
