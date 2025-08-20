import React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function fetchJSON(url:string) {
  try { const r = await fetch(url,{ cache:'no-store' }); if(!r.ok) return null; return r.json(); } catch { return null; }
}

async function Results({ q }: { q:string }) {
  if(!q) return <div className="text-sm text-slate-400">Type in the search bar above to begin.</div>;
  const [clients, vendors] = await Promise.all([
    fetchJSON(process.env.NEXT_PUBLIC_API_URL+`/clients?limit=5&search=${encodeURIComponent(q)}`),
    fetchJSON(process.env.NEXT_PUBLIC_API_URL+`/vendors?limit=5&search=${encodeURIComponent(q)}`)
  ]);
  if(!clients && !vendors) return <div className="text-sm text-red-400">Search service unavailable.</div>;
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">Clients</h2>
        <div className="space-y-1">
          {(clients?.items||[]).length ? clients.items.map((c:any)=> (
            <Link key={c._id} href={`/dashboard/clients?id=${c._id}`} className="block px-3 py-2 rounded bg-slate-900/60 hover:bg-slate-900/80 text-xs text-slate-200">{c.name}</Link>
          )): <div className="text-xs text-slate-600">No matches</div>}
        </div>
      </section>
      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">Vendors</h2>
        <div className="space-y-1">
          {(vendors?.items||[]).length ? vendors.items.map((v:any)=> (
            <Link key={v._id} href={`/dashboard/vendors?id=${v._id}`} className="block px-3 py-2 rounded bg-slate-900/60 hover:bg-slate-900/80 text-xs text-slate-200">{v.name}</Link>
          )): <div className="text-xs text-slate-600">No matches</div>}
        </div>
      </section>
    </div>
  );
}

export default async function SearchPage({ searchParams }: any) {
  const q = (searchParams?.q||'').toString();
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-100">Search</h1>
        {q && <p className="text-sm text-slate-500 mt-1">Results for: <span className="text-slate-300">{q}</span></p>}
      </div>
      <Suspense fallback={<div className="text-xs text-slate-500">Loading…</div>}>
        <Results q={q} />
      </Suspense>
    </div>
  );
}
