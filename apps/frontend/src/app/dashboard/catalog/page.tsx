'use client';
import Layout from '../../../components/Layout';
import { useEffect, useState } from 'react';
import { API_BASE } from '../../../lib/api';

interface CatalogItem { _id:string; sku:string; name:string; vendorName?:string; baseCost:number; defaultMarginPct:number; sellPrice:number; inventoryQty?:number; tags?:string[]; }

export default function CatalogPage(){
  const [items,setItems]=useState<CatalogItem[]>([]);
  const [loading,setLoading]=useState(true);
  const [q,setQ]=useState('');
  const [tag,setTag]=useState('');
  const [info,setInfo]=useState<any>(null);
  const token = (typeof window!=='undefined') ? localStorage.getItem('accessToken') : '';

  const fetchCatalog = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if(q) params.append('q',q);
    if(tag) params.append('tag',tag);
    const res = await fetch(`${API_BASE}/catalog?${params.toString()}`, { headers:{ Authorization:`Bearer ${token}` }});
    if(res.ok){ const data= await res.json(); setItems(data.items); setInfo(data.aggregates); }
    setLoading(false);
  };
  useEffect(()=>{ fetchCatalog(); // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  return (
    <Layout>
      <div className='space-y-6'>
        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-5'>
          <div className='space-y-2'>
            <h1 className='heading-secondary md:heading-primary !mb-0'>Catalog</h1>
            <p className='text-sm text-slate-600 dark:text-[var(--text-dim)]'>Unified vendors & price list intelligence</p>
            <div className='flex flex-wrap gap-3 pt-2'>
              <div className='stat-block'>
                <small>Items</small>
                <span>{info?.count ?? 0}</span>
              </div>
              <div className='stat-block'>
                <small>Vendors</small>
                <span>{info?.vendors ?? 0}</span>
              </div>
              <div className='stat-block'>
                <small>Cost Range</small>
                <span>{(info?.minCost ?? 0).toFixed(2)} - {(info?.maxCost ?? 0).toFixed(2)}</span>
              </div>
              <div className='stat-block'>
                <small>Avg Margin</small>
                <span>{(info?.avgMarginPct ?? 0).toFixed(1)}%</span>
              </div>
            </div>
            <p className='text-xs text-slate-500 dark:text-[var(--text-dim)] pt-2 max-w-xl'>Live aggregates update with your filters. Use SKU or tag filters to narrow pricing intelligence and margin spread.</p>
          </div>
          <div className='flex gap-2 flex-wrap items-center surface-solid p-3 rounded-lg'>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder='Search sku/name' className='input !py-1.5 !text-xs min-w-[180px]' />
            <input value={tag} onChange={e=>setTag(e.target.value)} placeholder='Tag filter' className='input !py-1.5 !text-xs w-[120px]' />
            <button onClick={fetchCatalog} className='btn btn-amber btn-sm'>Search</button>
          </div>
        </div>
        <div className='surface-solid rounded-xl overflow-hidden'>
          <div className='overflow-auto max-h-[70vh]'>
            <table className='w-full text-sm'>
              <thead className='text-left text-[11px] uppercase tracking-wide text-slate-500 dark:text-gray-400 bg-slate-50 dark:bg-[var(--surface-2)]'>
                <tr className='border-b border-token'>
                  <th className='py-2 px-3'>SKU</th>
                  <th className='py-2 px-3'>Name</th>
                  <th className='py-2 px-3'>Vendor</th>
                  <th className='py-2 px-3'>Cost</th>
                  <th className='py-2 px-3'>Margin %</th>
                  <th className='py-2 px-3'>Sell</th>
                  <th className='py-2 px-3'>Inventory</th>
                  <th className='py-2 px-3'>Tags</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-[var(--border)]/60'>
                {loading && <tr><td colSpan={8} className='py-6 text-center text-xs'>Loading...</td></tr>}
                {!loading && items.map(it=> (
                  <tr key={it._id} className='hover:bg-[var(--surface-3)]/40 transition-colors'>
                    <td className='py-2 px-3 font-medium'>{it.sku}</td>
                    <td className='py-2 px-3'>{it.name}</td>
                    <td className='py-2 px-3 text-[11px]'>{it.vendorName||'—'}</td>
                    <td className='py-2 px-3'>{it.baseCost.toFixed(2)}</td>
                    <td className='py-2 px-3'>{it.defaultMarginPct}</td>
                    <td className='py-2 px-3'>{it.sellPrice.toFixed(2)}</td>
                    <td className='py-2 px-3 text-[11px]'>{it.inventoryQty ?? '—'}</td>
                    <td className='py-2 px-3 text-[11px]'>{(it.tags||[]).join(', ')}</td>
                  </tr>
                ))}
                {!loading && items.length===0 && <tr><td colSpan={8} className='py-6 text-center text-xs text-gray-500'>No results</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
