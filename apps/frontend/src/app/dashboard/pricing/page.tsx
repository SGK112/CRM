'use client';
import Layout from '../../../components/Layout';
import { useEffect, useState, useRef } from 'react';
import { API_BASE } from '../../../lib/api';

interface PriceItem { _id:string; sku:string; name:string; baseCost:number; defaultMarginPct:number; unit:string; vendorId?:string; tags?:string[]; }

export default function PricingPage(){
  const [items,setItems]=useState<PriceItem[]>([]);
  const [loading,setLoading]=useState(true);
  const [fileName,setFileName]=useState('');
  const fileRef = useRef<HTMLInputElement|null>(null);
  const token = (typeof window!=='undefined') ? localStorage.getItem('accessToken') : '';

  const fetchItems = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/pricing/items`, { headers:{ Authorization:`Bearer ${token}` }});
    if(res.ok) setItems(await res.json());
    setLoading(false);
  };
  useEffect(()=>{ fetchItems(); // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const parseCsv = async (file:File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(l=>l.trim().length);
    if(!lines.length) return [];
    const header = lines[0].split(',').map(h=>h.trim().toLowerCase());
    return lines.slice(1).map(line=>{
      const cols = line.split(',');
      const row: any = {};
      header.forEach((h,i)=> row[h]=cols[i]?.trim());
      return { sku: row.sku, name: row.name, baseCost: parseFloat(row.cost||row.basecost||'0')||0, unit: row.unit||'each', defaultMarginPct: parseFloat(row.margin||row.defaultmarginpct||'0')||0, tags: (row.tags? row.tags.split('|'):[]) };
    }).filter(r=>r.sku && r.name);
  };

  const uploadCsv = async (file:File) => {
    const payload = await parseCsv(file);
    if(!payload.length) return;
    await fetch(`${API_BASE}/pricing/items/bulk-upsert`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify({ items: payload }) });
    fetchItems();
  };

  return (
    <Layout>
      <div className='space-y-6'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold'>Price List</h1>
            <p className='text-sm text-gray-600 dark:text-[var(--text-dim)]'>Manage standard cost & selling margins</p>
          </div>
          <div className='flex gap-2'>
            <input ref={fileRef} type='file' accept='.csv' hidden onChange={e=>{ const f=e.target.files?.[0]; if(f){ setFileName(f.name); uploadCsv(f);} }} />
            <button className='pill pill-tint-indigo sm' onClick={()=>fileRef.current?.click()}>Import CSV</button>
            {fileName && <span className='pill pill-tint-neutral sm'>{fileName}</span>}
          </div>
        </div>
        <div className='surface-1 border border-token rounded-xl overflow-hidden'>
          <table className='w-full text-sm'>
            <thead className='text-left text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              <tr className='border-b border-token'>
                <th className='py-2 px-3'>SKU</th>
                <th className='py-2 px-3'>Name</th>
                <th className='py-2 px-3'>Cost</th>
                <th className='py-2 px-3'>Margin %</th>
                <th className='py-2 px-3'>Sell Price</th>
                <th className='py-2 px-3'>Unit</th>
                <th className='py-2 px-3'>Tags</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[var(--border)]/60'>
              {loading && <tr><td colSpan={7} className='py-6 text-center text-xs'>Loading...</td></tr>}
              {!loading && items.map(it=> {
                const sell = it.baseCost * (1 + (it.defaultMarginPct||0)/100);
                return (
                  <tr key={it._id} className='hover:bg-[var(--surface-2)]/60'>
                    <td className='py-2 px-3 font-medium'>{it.sku}</td>
                    <td className='py-2 px-3'>{it.name}</td>
                    <td className='py-2 px-3'>{it.baseCost.toFixed(2)}</td>
                    <td className='py-2 px-3'>{it.defaultMarginPct}</td>
                    <td className='py-2 px-3'>{sell.toFixed(2)}</td>
                    <td className='py-2 px-3 text-[11px]'>{it.unit}</td>
                    <td className='py-2 px-3 text-[11px]'>{(it.tags||[]).join(', ')}</td>
                  </tr>
                );
              })}
              {!loading && items.length===0 && <tr><td colSpan={7} className='py-6 text-center text-xs text-gray-500'>No items yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
