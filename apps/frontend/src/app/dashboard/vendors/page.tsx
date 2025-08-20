'use client';
import Layout from '../../../components/Layout';
import { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../../../lib/api';
import { PageHeader } from '../../../components/ui/PageHeader';
import { ArrowPathIcon, PlusIcon, FunnelIcon, MagnifyingGlassIcon, TagIcon } from '@heroicons/react/24/outline';

interface Vendor { _id:string; name:string; categories?:string[]; createdAt:string; updatedAt?:string; contactName?:string; contactEmail?:string; contactPhone?:string; website?:string; salesRepName?:string; salesRepEmail?:string; salesRepPhone?:string; orderingProcess?:string; paymentTerms?:string; leadTimeDays?:number; minimumOrder?:string; logisticsNotes?:string; notes?:string; tags?:string[]; meta?:Record<string,any>; }

export default function VendorsPage(){
  // Data
  const [vendors,setVendors] = useState<Vendor[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string>('');

  // Form state
  const [draftName,setDraftName] = useState('');
  const [draftCategory,setDraftCategory] = useState('');
  const [draftWebsite,setDraftWebsite] = useState('');
  const [draftContactName,setDraftContactName] = useState('');
  const [draftContactEmail,setDraftContactEmail] = useState('');
  const [draftContactPhone,setDraftContactPhone] = useState('');
  const [draftSalesRepName,setDraftSalesRepName] = useState('');
  const [draftSalesRepEmail,setDraftSalesRepEmail] = useState('');
  const [draftSalesRepPhone,setDraftSalesRepPhone] = useState('');
  const [draftOrderingProcess,setDraftOrderingProcess] = useState('');
  const [draftPaymentTerms,setDraftPaymentTerms] = useState('');
  const [draftLeadTimeDays,setDraftLeadTimeDays] = useState<string>('');
  const [draftMinimumOrder,setDraftMinimumOrder] = useState('');
  const [draftLogisticsNotes,setDraftLogisticsNotes] = useState('');
  const [draftNotes,setDraftNotes] = useState('');
  const [tagInput,setTagInput] = useState('');
  const [tags,setTags] = useState<string[]>([]);
  const [categories,setCategories] = useState<string[]>([]);
  const [meta,setMeta] = useState<{key:string; value:string; id:string}[]>([]);
  const [metaKey,setMetaKey] = useState('');
  const [metaValue,setMetaValue] = useState('');
  const [saving,setSaving] = useState(false);
  const [saveError,setSaveError] = useState('');
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

  const resetDraft = () => {
    setDraftName(''); setDraftCategory(''); setDraftWebsite(''); setDraftContactName(''); setDraftContactEmail(''); setDraftContactPhone('');
    setDraftSalesRepName(''); setDraftSalesRepEmail(''); setDraftSalesRepPhone(''); setDraftOrderingProcess(''); setDraftPaymentTerms('');
    setDraftLeadTimeDays(''); setDraftMinimumOrder(''); setDraftLogisticsNotes(''); setDraftNotes(''); setTagInput(''); setTags([]); setCategories([]); setMeta([]); setSaveError('');
  };

  const addTag = () => {
    if(!tagInput.trim()) return; const val = tagInput.trim(); if(tags.includes(val)) { setTagInput(''); return; }
    setTags(t=>[...t,val]); setTagInput('');
  };
  const removeTag = (t:string) => setTags(tags.filter(x=>x!==t));

  const addCategory = () => {
    if(!draftCategory.trim()) return; const val = draftCategory.trim(); if(categories.includes(val)) { setDraftCategory(''); return; }
    setCategories(c=>[...c,val]); setDraftCategory('');
  };
  const removeCategory = (c:string) => setCategories(prev=> prev.filter(x=> x!==c));

  const addMeta = () => {
    if(!metaKey.trim()) return; setMeta(m=> [...m,{ key:metaKey.trim(), value:metaValue.trim(), id:crypto.randomUUID() }]); setMetaKey(''); setMetaValue('');
  };
  const removeMeta = (id:string) => setMeta(m=> m.filter(x=> x.id!==id));

  const buildPayload = () => {
    const payload:any = { name: draftName.trim() };
    if (categories.length) payload.categories = categories;
    if (draftWebsite) payload.website = draftWebsite.trim();
    if (draftContactName) payload.contactName = draftContactName.trim();
    if (draftContactEmail) payload.contactEmail = draftContactEmail.trim();
    if (draftContactPhone) payload.contactPhone = draftContactPhone.trim();
    if (draftSalesRepName) payload.salesRepName = draftSalesRepName.trim();
    if (draftSalesRepEmail) payload.salesRepEmail = draftSalesRepEmail.trim();
    if (draftSalesRepPhone) payload.salesRepPhone = draftSalesRepPhone.trim();
    if (draftOrderingProcess) payload.orderingProcess = draftOrderingProcess.trim();
    if (draftPaymentTerms) payload.paymentTerms = draftPaymentTerms.trim();
    if (draftLeadTimeDays) payload.leadTimeDays = Number(draftLeadTimeDays) || undefined;
    if (draftMinimumOrder) payload.minimumOrder = draftMinimumOrder.trim();
    if (draftLogisticsNotes) payload.logisticsNotes = draftLogisticsNotes.trim();
    if (draftNotes) payload.notes = draftNotes.trim();
    if (tags.length) payload.tags = tags;
    if (meta.length) payload.meta = meta.reduce((acc,kv)=> { acc[kv.key]=kv.value; return acc; }, {} as Record<string,any>);
    return payload;
  };

  const addVendor = async () => {
    if(!draftName.trim()) { setSaveError('Name is required'); return; }
    setSaving(true); setSaveError('');
    const payload = buildPayload();
    try {
      const res = await fetch(`${API_BASE}/vendors`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify(payload) });
      if(!res.ok) throw new Error(`Save failed (${res.status})`);
      const created:Vendor = await res.json();
      // Optimistic: prepend
      setVendors(v=> [created, ...v]);
      resetDraft(); setShowNew(false);
    } catch (e:any) {
      setSaveError(e.message||'Failed saving vendor');
    } finally { setSaving(false); }
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
          <div className="surface-1 border border-dashed border-token rounded-xl p-5 space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-[var(--text)]">New Vendor</h3>
              {saveError && <span className="text-[11px] text-red-500">{saveError}</span>}
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="space-y-4 lg:col-span-2">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-[11px] font-medium uppercase tracking-wide block mb-1">Name *</label>
                    <input value={draftName} onChange={e=>setDraftName(e.target.value)} placeholder="Acme Supply Co" className="input" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-wide block mb-1">Website</label>
                    <input value={draftWebsite} onChange={e=>setDraftWebsite(e.target.value)} placeholder="https://" className="input" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-wide block mb-1">Contact Name</label>
                    <input value={draftContactName} onChange={e=>setDraftContactName(e.target.value)} placeholder="Primary contact" className="input" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium uppercase tracking-wide block mb-1">Contact Email</label>
                      <input type="email" value={draftContactEmail} onChange={e=>setDraftContactEmail(e.target.value)} placeholder="contact@vendor.com" className="input" />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium uppercase tracking-wide block mb-1">Contact Phone</label>
                      <input value={draftContactPhone} onChange={e=>setDraftContactPhone(e.target.value)} placeholder="###" className="input" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-wide block mb-1">Sales Rep Name</label>
                    <input value={draftSalesRepName} onChange={e=>setDraftSalesRepName(e.target.value)} placeholder="Rep name" className="input" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium uppercase tracking-wide block mb-1">Rep Email</label>
                      <input type="email" value={draftSalesRepEmail} onChange={e=>setDraftSalesRepEmail(e.target.value)} placeholder="rep@..." className="input" />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium uppercase tracking-wide block mb-1">Rep Phone</label>
                      <input value={draftSalesRepPhone} onChange={e=>setDraftSalesRepPhone(e.target.value)} placeholder="###" className="input" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-wide block mb-1">Payment Terms</label>
                    <input value={draftPaymentTerms} onChange={e=>setDraftPaymentTerms(e.target.value)} placeholder="Net 30" className="input" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium uppercase tracking-wide block mb-1">Lead Time (days)</label>
                      <input value={draftLeadTimeDays} onChange={e=>setDraftLeadTimeDays(e.target.value)} placeholder="7" className="input" />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium uppercase tracking-wide block mb-1">Minimum Order</label>
                      <input value={draftMinimumOrder} onChange={e=>setDraftMinimumOrder(e.target.value)} placeholder="$500 / 50 units" className="input" />
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-wide block mb-1">Ordering Process</label>
                    <textarea value={draftOrderingProcess} onChange={e=>setDraftOrderingProcess(e.target.value)} rows={3} placeholder="Portal URL, email POs, call rep, etc." className="input" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-wide block mb-1">Logistics Notes</label>
                    <textarea value={draftLogisticsNotes} onChange={e=>setDraftLogisticsNotes(e.target.value)} rows={3} placeholder="Freight carrier, cutoff times, restrictions" className="input" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium uppercase tracking-wide block mb-1">Internal Notes</label>
                  <textarea value={draftNotes} onChange={e=>setDraftNotes(e.target.value)} rows={3} placeholder="Any internal commentary..." className="input" />
                </div>
              </div>
              <div className="space-y-6">
                {/* Categories */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wide block">Categories</label>
                  <div className="flex gap-2">
                    <input value={draftCategory} onChange={e=>setDraftCategory(e.target.value)} onKeyDown={e=> { if(e.key==='Enter'){ e.preventDefault(); addCategory(); } }} placeholder="Add category" className="input" />
                    <button onClick={addCategory} type="button" className="pill pill-tint-blue text-[11px]">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(c=> <span key={c} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-600/25 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-medium flex items-center gap-1">{c}<button onClick={()=>removeCategory(c)} className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200">×</button></span>)}
                    {!categories.length && <span className="text-[10px] text-slate-400">None yet</span>}
                  </div>
                </div>
                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wide block">Tags</label>
                  <div className="flex gap-2">
                    <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=> { if(e.key==='Enter'){ e.preventDefault(); addTag(); } }} placeholder="Add tag" className="input" />
                    <button onClick={addTag} type="button" className="pill pill-tint-purple text-[11px]">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(t=> <span key={t} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-600/25 text-purple-700 dark:text-purple-300 rounded-full text-[10px] font-medium flex items-center gap-1">{t}<button onClick={()=>removeTag(t)} className="ml-1 text-purple-600 hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200">×</button></span>)}
                    {!tags.length && <span className="text-[10px] text-slate-400">No tags</span>}
                  </div>
                </div>
                {/* Meta */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wide block">Custom Fields</label>
                  <div className="flex gap-2">
                    <input value={metaKey} onChange={e=>setMetaKey(e.target.value)} placeholder="Key" className="input" />
                    <input value={metaValue} onChange={e=>setMetaValue(e.target.value)} placeholder="Value" className="input" />
                    <button onClick={addMeta} type="button" className="pill pill-tint-green text-[11px] whitespace-nowrap">Add</button>
                  </div>
                  <div className="space-y-1">
                    {meta.map(m=> (
                      <div key={m.id} className="flex items-center justify-between px-2 py-1 rounded bg-slate-100 dark:bg-[var(--surface-2)] text-[11px]">
                        <span className="font-medium text-slate-600 dark:text-[var(--text-dim)]">{m.key}</span>
                        <span className="text-slate-500 dark:text-[var(--text-dim)]">{m.value}</span>
                        <button onClick={()=>removeMeta(m.id)} className="ml-2 text-slate-500 hover:text-red-500">×</button>
                      </div>
                    ))}
                    {!meta.length && <div className="text-[10px] text-slate-400">No custom fields</div>}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={addVendor} disabled={saving} className="pill pill-tint-green inline-flex items-center gap-1 text-xs disabled:opacity-50">{saving ? 'Saving…' : (<><PlusIcon className="h-4 w-4"/>Create</> )}</button>
              <button onClick={()=> { resetDraft(); setShowNew(false); }} className="pill pill-tint-gray text-xs">Cancel</button>
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
