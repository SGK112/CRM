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
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold'>Catalog</h1>
            <p className='text-sm text-gray-600 dark:text-[var(--text-dim)]'>Unified vendors & price list intelligence</p>
          </div>
          <div className='flex gap-2 flex-wrap'>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder='Search sku/name' className='input !py-1.5 !text-xs min-w-[180px]' />
            <input value={tag} onChange={e=>setTag(e.target.value)} placeholder='Tag filter' className='input !py-1.5 !text-xs w-[120px]' />
            <button onClick={fetchCatalog} className='pill pill-tint-blue sm'>Search</button>
          </div>
        </div>
        {info && (
          <div className='flex flex-wrap gap-2 text-[11px]'>
            <span className='pill pill-tint-neutral sm'>Items {info.count}</span>
            <span className='pill pill-tint-neutral sm'>Vendors {info.vendors}</span>
            <span className='pill pill-tint-neutral sm'>Cost {info.minCost?.toFixed?.(2)} - {info.maxCost?.toFixed?.(2)}</span>
            <span className='pill pill-tint-neutral sm'>Avg Margin {info.avgMarginPct?.toFixed?.(1)}%</span>
          </div>
        )}
        <div className='surface-1 border border-token rounded-xl overflow-hidden'>
          <table className='w-full text-sm'>
            <thead className='text-left text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400'>
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
                <tr key={it._id} className='hover:bg-[var(--surface-2)]/60'>
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
    </Layout>
  );
}
