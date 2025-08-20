'use client';
import Layout from '../../../components/Layout';
import { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../../../lib/api';
import { PageHeader } from '../../../components/ui/PageHeader';
import { ArrowPathIcon, PlusIcon, FunnelIcon, MagnifyingGlassIcon, TagIcon } from '@heroicons/react/24/outline';

interface Vendor { _id:string; name:string; categories?:string[]; createdAt:string; updatedAt?:string; contactName?:string; phone?:string; email?:string; rating?:number; notesCount?:number; }

export default function VendorsPage(){
  // Data
  const [vendors,setVendors] = useState<Vendor[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string>('');

  // Form state
  const [draftName,setDraftName] = useState('');
  const [draftCategory,setDraftCategory] = useState('');
  const [showNew,setShowNew] = useState(false);

  // Filters / search
  const [query,setQuery] = useState('');
  const [categoryFilter,setCategoryFilter] = useState<string>('');
  const token = (typeof window!=='undefined') ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) : '';

  const fetchVendors = async () => {
    try {
      setLoading(true); setError('');
      const res = await fetch(`${API_BASE}/vendors`, { headers:{ Authorization:`Bearer ${token}` }});
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setVendors(json);
    } catch (e:any) { setError(e.message||'Failed loading vendors'); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ fetchVendors(); // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const addVendor = async () => {
    if(!draftName.trim()) return;
    try {
      const payload:any = { name: draftName.trim() };
      if (draftCategory.trim()) payload.categories = [draftCategory.trim()];
      await fetch(`${API_BASE}/vendors`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify(payload) });
      setDraftName(''); setDraftCategory(''); setShowNew(false); fetchVendors();
    } catch {/* ignore */}
  };

  // Derive categories list & filtered vendors
  const allCategories = useMemo(()=> Array.from(new Set(vendors.flatMap(v=> v.categories||[]))).sort(), [vendors]);
  const filtered = useMemo(()=> vendors.filter(v => {
    if (query && !v.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (categoryFilter && !(v.categories||[]).includes(categoryFilter)) return false;
    return true;
  }), [vendors, query, categoryFilter]);

  const stats = [
    { label:'Total Vendors', value: vendors.length },
    { label:'Categories', value: allCategories.length || '—' },
    { label:'Showing', value: filtered.length },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <PageHeader
          title="Vendors"
          subtitle="Central directory of suppliers & trade partners feeding your catalog and pricing intelligence."
          stats={stats}
          actions={(
            <div className="flex gap-2">
              <button onClick={fetchVendors} className="pill pill-tint-blue inline-flex items-center gap-1 text-xs"><ArrowPathIcon className="h-4 w-4"/>Refresh</button>
              <button onClick={()=> setShowNew(s=>!s)} className="pill pill-tint-green inline-flex items-center gap-1 text-xs"><PlusIcon className="h-4 w-4"/>{showNew? 'Close':'New Vendor'}</button>
            </div>
          )}
        />

        {/* Filters */}
        <div className="surface-1 border border-token rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search (span 3 on md) */}
            <div className="md:col-span-3 flex flex-col">
              <label className="text-[11px] font-medium uppercase tracking-wide block mb-1 text-slate-500">Search</label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find vendor..." className="input input-icon w-full" />
              </div>
            </div>
            {/* Category */}
            <div className="flex flex-col">
              <label className="text-[11px] font-medium uppercase tracking-wide block mb-1 text-slate-500 flex items-center gap-1"><TagIcon className="h-3 w-3"/>Category</label>
              <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} className="input pr-8 w-full min-w-[160px]">
                <option value="">All</option>
                {allCategories.map(c=> <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {/* Actions */}
            <div className="flex flex-col">
              <label className="text-[11px] font-medium uppercase tracking-wide block mb-1 text-slate-500 opacity-0 select-none">Reset</label>
              <div className="flex gap-2">
                <button onClick={()=> { setQuery(''); setCategoryFilter(''); }} className="pill pill-tint-gray text-xs inline-flex items-center gap-1 flex-1 justify-center"><FunnelIcon className="h-4 w-4"/>Reset</button>
              </div>
            </div>
          </div>
        </div>

        {/* New Vendor Inline Form */}
        {showNew && (
          <div className="surface-1 border border-dashed border-token rounded-xl p-4 space-y-3 animate-in fade-in">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wide block mb-1 text-slate-500">Name</label>
                <input value={draftName} onChange={e=>setDraftName(e.target.value)} placeholder="Acme Supply Co" className="input" />
              </div>
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wide block mb-1 text-slate-500">Category</label>
                <input value={draftCategory} onChange={e=>setDraftCategory(e.target.value)} placeholder="Lumber" className="input" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={addVendor} disabled={!draftName.trim()} className="pill pill-tint-green inline-flex items-center gap-1 text-xs disabled:opacity-50"><PlusIcon className="h-4 w-4"/>Create</button>
              <button onClick={()=> { setDraftName(''); setDraftCategory(''); setShowNew(false); }} className="pill pill-tint-gray text-xs">Cancel</button>
            </div>
          </div>
        )}

        {/* Vendors Table */}
        <div className="surface-1 border border-token rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-token flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-[var(--text)]">Directory</h2>
            {loading && <span className="text-[10px] text-slate-500">Loading…</span>}
          </div>
          {error && <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-b border-red-100">{error}</div>}
          {(!loading && !filtered.length) && (
            <div className="p-8 text-center text-sm text-slate-500">No vendors match your filters.</div>
          )}
          {filtered.length>0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-[var(--surface-2)] text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="text-left font-medium px-4 py-2">Name</th>
                    <th className="text-left font-medium px-4 py-2">Categories</th>
                    <th className="text-left font-medium px-4 py-2">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-token">
                  {filtered.map(v => (
                    <tr key={v._id} className="hover:bg-slate-50/60 dark:hover:bg-[var(--surface-2)]/60">
                      <td className="px-4 py-2 font-medium text-slate-800 dark:text-[var(--text)]">{v.name}</td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap gap-1">
                          {(v.categories||['—']).map(c => (
                            <span key={c} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[var(--surface-2)] text-[10px] font-medium text-slate-700 dark:text-[var(--text-dim)] border border-slate-200 dark:border-[var(--border)]">{c}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-[11px] text-slate-500">{new Date(v.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
