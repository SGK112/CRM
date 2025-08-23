'use client';
import Layout from '../../../../components/Layout';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
// Use rewrite path for API calls

interface LineItem { _id?:string; name:string; description?:string; quantity:number; baseCost:number; marginPct:number; sellPrice:number; taxable:boolean; }
interface Estimate { _id:string; number:string; status:string; items:LineItem[]; subtotalSell:number; subtotalCost:number; discountType:string; discountValue:number; discountAmount:number; taxRate:number; taxAmount:number; total:number; notes?:string; }

export default function EstimateDetailPage(){
  const params = useParams();
  const id = params?.id as string;
  const [est,setEst]=useState<Estimate|null>(null);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const token = (typeof window!=='undefined') ? localStorage.getItem('accessToken') : '';

  const fetchOne = async () => {
    setLoading(true);
  const res = await fetch(`/api/estimates/${id}`, { headers:{ Authorization:`Bearer ${token}` }});
    if(res.ok) setEst(await res.json());
    setLoading(false);
  };
  useEffect(()=>{ if(id) fetchOne(); },[id]);

  const recalc = async () => {
    if(!id) return; setSaving(true);
  await fetch(`/api/estimates/${id}/recalc`, { method:'POST', headers:{ Authorization:`Bearer ${token}` }});
    await fetchOne(); setSaving(false);
  };

  const sendEstimate = async () => {
    if(!id) return; setSaving(true);
  await fetch(`/api/estimates/${id}/send`, { method:'POST', headers:{ Authorization:`Bearer ${token}` }});
    await fetchOne(); setSaving(false);
  };

  const convert = async () => {
    if(!id) return; setSaving(true);
  await fetch(`/api/estimates/${id}/convert`, { method:'POST', headers:{ Authorization:`Bearer ${token}` }});
    setSaving(false);
    // Optionally redirect to invoices list after conversion
  };

  return (
    <Layout>
      <div className='space-y-6'>
        {loading && <div className='text-sm text-gray-500'>Loading...</div>}
        {!loading && est && (
          <>
            <div className='flex items-center justify-between flex-wrap gap-4'>
              <div>
                <h1 className='text-2xl font-semibold'>Estimate {est.number}</h1>
                <p className='text-sm text-gray-600 dark:text-[var(--text-dim)]'>Status: {est.status}</p>
              </div>
              <div className='flex gap-2'>
                <button onClick={recalc} disabled={saving} className='pill pill-tint-blue sm disabled:opacity-50'>Recalc</button>
                <button onClick={sendEstimate} disabled={saving || est.status!=='draft'} className='pill pill-tint-green sm disabled:opacity-50'>Send</button>
                <button onClick={convert} disabled={saving || est.status==='converted'} className='pill pill-tint-amber sm disabled:opacity-50'>Convert to Invoice</button>
              </div>
            </div>
            <div className='grid md:grid-cols-3 gap-6'>
              <div className='md:col-span-2 space-y-4'>
                <div className='surface-1 border border-token rounded-xl overflow-hidden'>
                  <table className='w-full text-sm'>
                    <thead className='text-left text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                      <tr className='border-b border-token'>
                        <th className='py-2 px-3'>Item</th>
                        <th className='py-2 px-3'>Qty</th>
                        <th className='py-2 px-3'>Cost</th>
                        <th className='py-2 px-3'>Margin%</th>
                        <th className='py-2 px-3'>Sell</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-[var(--border)]/60'>
                      {est.items.map((li,i)=>(
                        <tr key={i}>
                          <td className='py-2 px-3'>{li.name}</td>
                          <td className='py-2 px-3'>{li.quantity}</td>
                          <td className='py-2 px-3'>{li.baseCost.toFixed(2)}</td>
                          <td className='py-2 px-3'>{li.marginPct}</td>
                          <td className='py-2 px-3'>{li.sellPrice.toFixed(2)}</td>
                        </tr>
                      ))}
                      {est.items.length===0 && <tr><td colSpan={5} className='py-4 text-center text-xs text-gray-500'>No line items.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className='surface-1 border border-token rounded-xl p-4 space-y-2 text-sm'>
                  <div className='flex justify-between'><span>Subtotal Sell</span><span>{est.subtotalSell.toFixed(2)}</span></div>
                  <div className='flex justify-between'><span>Subtotal Cost</span><span>{est.subtotalCost.toFixed(2)}</span></div>
                  <div className='flex justify-between'><span>Discount</span><span>-{est.discountAmount.toFixed(2)}</span></div>
                  <div className='flex justify-between'><span>Tax</span><span>{est.taxAmount.toFixed(2)}</span></div>
                  <div className='flex justify-between font-semibold text-lg pt-2 border-t border-token'><span>Total</span><span>{est.total.toFixed(2)}</span></div>
                </div>
              </div>
              <div className='space-y-4'>
                <div className='surface-1 border border-token rounded-xl p-4'>
                  <h3 className='font-semibold mb-2 text-sm'>Actions</h3>
                  <ul className='space-y-1 text-xs text-gray-600 dark:text-[var(--text-dim)]'>
                    <li>Recalc updates totals after edits.</li>
                    <li>Send will mark sent (email pending).</li>
                    <li>Convert creates invoice & marks converted.</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
