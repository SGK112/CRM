'use client';
import Layout from '../../../../components/Layout';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { API_BASE } from '../../../../lib/api';

interface LineItem { name:string; description?:string; quantity:number; unitPrice:number; total:number; taxable:boolean; }
interface Invoice { _id:string; number:string; status:string; items:LineItem[]; subtotal:number; taxRate:number; taxAmount:number; total:number; amountPaid:number; notes?:string; dueDate?:string; }

export default function InvoiceDetail(){
  const params = useParams();
  const id = params?.id as string;
  const [inv,setInv]=useState<Invoice|null>(null);
  const [loading,setLoading]=useState(true);
  const token = (typeof window!=='undefined') ? localStorage.getItem('accessToken') : '';
  const fetchOne = async () => {
    const res = await fetch(`${API_BASE}/invoices/${id}`, { headers:{ Authorization:`Bearer ${token}` }});
    if(res.ok) setInv(await res.json());
    setLoading(false);
  };
  useEffect(()=>{ if(id) fetchOne(); },[id]);
  return (
    <Layout>
      <div className='space-y-6'>
        {loading && <div className='text-sm text-gray-500'>Loading...</div>}
        {!loading && inv && (
          <>
            <div className='flex items-center justify-between flex-wrap gap-4'>
              <div>
                <h1 className='text-2xl font-semibold'>Invoice {inv.number}</h1>
                <p className='text-sm text-gray-600 dark:text-[var(--text-dim)]'>Status: {inv.status}</p>
              </div>
              <div className='flex gap-2'>
                <button className='pill pill-tint-blue sm'>Record Payment</button>
                <button className='pill pill-tint-green sm'>Send</button>
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
                        <th className='py-2 px-3'>Unit</th>
                        <th className='py-2 px-3'>Total</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-[var(--border)]/60'>
                      {inv.items.map((li,i)=>(
                        <tr key={i}>
                          <td className='py-2 px-3'>{li.name}</td>
                          <td className='py-2 px-3'>{li.quantity}</td>
                          <td className='py-2 px-3'>{li.unitPrice.toFixed(2)}</td>
                          <td className='py-2 px-3'>{li.total.toFixed(2)}</td>
                        </tr>
                      ))}
                      {inv.items.length===0 && <tr><td colSpan={4} className='py-4 text-center text-xs text-gray-500'>No line items.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className='surface-1 border border-token rounded-xl p-4 space-y-2 text-sm'>
                  <div className='flex justify-between'><span>Subtotal</span><span>{inv.subtotal.toFixed(2)}</span></div>
                  <div className='flex justify-between'><span>Tax</span><span>{inv.taxAmount.toFixed(2)}</span></div>
                  <div className='flex justify-between font-semibold text-lg pt-2 border-t border-token'><span>Total</span><span>{inv.total.toFixed(2)}</span></div>
                  <div className='flex justify-between'><span>Paid</span><span>{inv.amountPaid.toFixed(2)}</span></div>
                </div>
              </div>
              <div className='space-y-4'>
                <div className='surface-1 border border-token rounded-xl p-4'>
                  <h3 className='font-semibold mb-2 text-sm'>Actions</h3>
                  <ul className='space-y-1 text-xs text-gray-600 dark:text-[var(--text-dim)]'>
                    <li>Record payment updates amount paid.</li>
                    <li>Send will email invoice (pending integration).</li>
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
