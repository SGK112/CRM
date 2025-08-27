'use client';
import { useEffect, useState, useMemo } from 'react';
import { API_BASE } from '../../../lib/api';
import { PageHeader } from '../../../components/ui/PageHeader';

interface Invoice { _id:string; number:string; status:string; subtotal:number; taxAmount:number; total:number; createdAt:string; amountPaid:number; }

export default function InvoicesPage(){
  const [list,setList]=useState<Invoice[]>([]);
  const [loading,setLoading]=useState(true);
  const token = (typeof window!=='undefined') ? localStorage.getItem('accessToken') : '';
  const fetchList = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/invoices`, { headers:{ Authorization:`Bearer ${token}` }});
    if(res.ok) setList(await res.json());
    setLoading(false);
  };
  useEffect(()=>{ fetchList(); },[]);
  const aggregates = useMemo(()=>{
    if(!list.length) return { subtotal:0, tax:0, total:0, paid:0 };
    return list.reduce((acc,i)=>{ acc.subtotal+=i.subtotal; acc.tax+=i.taxAmount; acc.total+=i.total; acc.paid+=i.amountPaid; return acc; }, { subtotal:0, tax:0, total:0, paid:0 });
  },[list]);

  return (
    <div className='space-y-6'>
        <PageHeader
          title='Invoices'
          subtitle='Billing documents & payment tracking'
          titleClassName="font-bold text-brand-700 dark:text-brand-400 mb-0"
          actions={<button className='pill pill-tint-green sm' onClick={()=>{
            const params = new URLSearchParams(typeof window!=='undefined' ? window.location.search : '');
            const clientId = params.get('clientId');
            // Navigate to a new invoice page if/when added; for now, fallback to creating from estimate or direct API later.
            window.location.href = clientId ? `/dashboard/invoices/new?clientId=${clientId}` : `/dashboard/invoices/new`;
          }}>New Invoice</button>}
          stats={[
            { label:'Count', value: loading? '…' : list.length },
            { label:'Subtotal', value: aggregates.subtotal.toFixed(2) },
            { label:'Tax', value: aggregates.tax.toFixed(2) },
            { label:'Total', value: aggregates.total.toFixed(2) },
            { label:'Paid', value: aggregates.paid.toFixed(2) }
          ]}
        />
        <div className='surface-solid border border-token rounded-xl overflow-hidden'>
          <table className='w-full text-sm'>
            <thead className='text-left text-[11px] uppercase tracking-wide text-gray-700 dark:text-gray-300 bg-[var(--surface-1)]'>
              <tr className='border-b border-token'>
                <th className='py-2 px-3'>Number</th>
                <th className='py-2 px-3'>Status</th>
                <th className='py-2 px-3'>Subtotal</th>
                <th className='py-2 px-3'>Tax</th>
                <th className='py-2 px-3'>Total</th>
                <th className='py-2 px-3'>Paid</th>
                <th className='py-2 px-3'>Created</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[var(--border)]/60'>
              {loading && <tr><td colSpan={7} className='py-6 text-center text-xs'>Loading...</td></tr>}
              {!loading && list.map(inv=> (
                <tr key={inv._id} className='hover:bg-[var(--surface-2)]/60'>
                  <td className='py-2 px-3 font-medium'>{inv.number}</td>
                  <td className='py-2 px-3 text-[11px]'>{inv.status}</td>
                  <td className='py-2 px-3'>{inv.subtotal.toFixed(2)}</td>
                  <td className='py-2 px-3'>{inv.taxAmount.toFixed(2)}</td>
                  <td className='py-2 px-3'>{inv.total.toFixed(2)}</td>
                  <td className='py-2 px-3'>{inv.amountPaid.toFixed(2)}</td>
                  <td className='py-2 px-3 text-[11px]'>{new Date(inv.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {!loading && list.length===0 && <tr><td colSpan={7} className='py-6 text-center text-xs text-gray-700'>No invoices yet.</td></tr>}
            </tbody>
          </table>
        </div>
    </div>
  );
}
