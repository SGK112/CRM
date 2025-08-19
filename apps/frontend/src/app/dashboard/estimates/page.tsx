'use client';
import Layout from '../../../components/Layout';
import { useEffect, useState } from 'react';
import { API_BASE } from '../../../lib/api';

interface Estimate { _id:string; number:string; total:number; status:string; totalMargin:number; subtotalCost:number; subtotalSell:number; taxAmount:number; discountAmount:number; createdAt:string; }

export default function EstimatesPage(){
  const [estimates,setEstimates]=useState<Estimate[]>([]);
  const [loading,setLoading]=useState(true);
  const token = (typeof window!=='undefined') ? localStorage.getItem('accessToken') : '';

  const fetchEstimates = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/estimates`, { headers:{ Authorization:`Bearer ${token}` }});
    if(res.ok) setEstimates(await res.json());
    setLoading(false);
  };
  useEffect(()=>{ fetchEstimates(); // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  return (
    <Layout>
      <div className='space-y-6'>
        <div className='flex items-center justify-between flex-wrap gap-4'>
          <div>
            <h1 className='text-2xl font-semibold'>Estimates</h1>
            <p className='text-sm text-gray-600 dark:text-[var(--text-dim)]'>Quote proposals & pricing breakdown</p>
          </div>
          <div className='flex gap-2'>
            <button className='pill pill-tint-green sm'>New Estimate</button>
          </div>
        </div>
        <div className='surface-1 border border-token rounded-xl overflow-hidden'>
          <table className='w-full text-sm'>
            <thead className='text-left text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              <tr className='border-b border-token'>
                <th className='py-2 px-3'>Number</th>
                <th className='py-2 px-3'>Status</th>
                <th className='py-2 px-3'>Sell</th>
                <th className='py-2 px-3'>Cost</th>
                <th className='py-2 px-3'>Margin</th>
                <th className='py-2 px-3'>Discount</th>
                <th className='py-2 px-3'>Tax</th>
                <th className='py-2 px-3'>Created</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[var(--border)]/60'>
              {loading && <tr><td colSpan={8} className='py-6 text-center text-xs'>Loading...</td></tr>}
              {!loading && estimates.map(e=> {
                const marginPct = e.subtotalSell>0 ? ( (e.totalMargin / e.subtotalSell) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={e._id} className='hover:bg-[var(--surface-2)]/60'>
                    <td className='py-2 px-3 font-medium'>{e.number}</td>
                    <td className='py-2 px-3 text-[11px]'>{e.status}</td>
                    <td className='py-2 px-3'>{e.subtotalSell.toFixed(2)}</td>
                    <td className='py-2 px-3'>{e.subtotalCost.toFixed(2)}</td>
                    <td className='py-2 px-3'>{e.totalMargin.toFixed(2)} ({marginPct}%)</td>
                    <td className='py-2 px-3'>{e.discountAmount.toFixed(2)}</td>
                    <td className='py-2 px-3'>{e.taxAmount.toFixed(2)}</td>
                    <td className='py-2 px-3 text-[11px]'>{new Date(e.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
              {!loading && estimates.length===0 && <tr><td colSpan={8} className='py-6 text-center text-xs text-gray-500'>No estimates yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
