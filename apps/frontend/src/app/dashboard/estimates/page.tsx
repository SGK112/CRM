'use client';
import Layout from '../../../components/Layout';
import { useEffect, useState, useMemo } from 'react';
// Use frontend rewrite for API calls
import { PageHeader } from '../../../components/ui/PageHeader';

interface Estimate { _id:string; number:string; total:number; status:string; totalMargin:number; subtotalCost:number; subtotalSell:number; taxAmount:number; discountAmount:number; createdAt:string; }

export default function EstimatesPage(){
  const [estimates,setEstimates]=useState<Estimate[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string>('');
  const token = (typeof window!=='undefined') ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) : '';

  const fetchEstimates = async () => {
    if (!token) {
      setError('Authentication required. Please log in.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
  const res = await fetch(`/api/estimates`, { 
        headers:{ 
          Authorization:`Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if(res.ok) {
        const data = await res.json();
        setEstimates(data);
      } else {
        const errorText = await res.text();
        setError(`Failed to load estimates: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
    setLoading(false);
  };
  const createDemoEstimate = async () => {
    if (!token) {
      setError('Authentication required to create estimates.');
      return;
    }

    try {
      const demoEstimate = {
        clientId: 'demo-client-id',
        items: [
          {
            name: 'Kitchen Cabinets',
            description: 'Premium wood kitchen cabinets',
            quantity: 15,
            baseCost: 500,
            marginPct: 50,
            taxable: true,
            sku: 'KC001'
          },
          {
            name: 'Granite Countertops',
            description: 'Premium granite countertops',
            quantity: 25,
            baseCost: 80,
            marginPct: 60,
            taxable: true,
            sku: 'GC001'
          }
        ],
        discountType: 'percent',
        discountValue: 5,
        taxRate: 8.5,
        notes: 'Demo estimate for kitchen remodel'
      };

  const res = await fetch(`/api/estimates`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(demoEstimate)
      });

      if (res.ok) {
        fetchEstimates(); // Refresh the list
      } else {
        const errorText = await res.text();
        setError(`Failed to create demo estimate: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      setError('Failed to create demo estimate');
    }
  };

  useEffect(()=>{ fetchEstimates(); // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const aggregates = useMemo(()=>{
    if(!estimates.length) return { sell:0, cost:0, margin:0, tax:0, discount:0 };
    return estimates.reduce((acc,e)=>{
      acc.sell += e.subtotalSell; acc.cost += e.subtotalCost; acc.margin += e.totalMargin; acc.tax += e.taxAmount; acc.discount += e.discountAmount; return acc; }, { sell:0, cost:0, margin:0, tax:0, discount:0 });
  },[estimates]);

  return (
    <Layout>
      <div className='space-y-6'>
        <PageHeader
          title='Estimates'
          subtitle='Quote proposals & pricing breakdown'
          actions={
            <div className="space-x-2">
              <button 
                onClick={createDemoEstimate}
                className='pill pill-tint-blue sm'
                disabled={loading}
              >
                Create Demo Estimate
              </button>
              <button className='pill pill-tint-green sm'>New Estimate</button>
            </div>
          }
          stats={[
            { label:'Count', value: loading? '…' : estimates.length },
            { label:'Sell', value: aggregates.sell.toFixed(2) },
            { label:'Cost', value: aggregates.cost.toFixed(2) },
            { label:'Margin', value: aggregates.margin.toFixed(2) },
            { label:'Tax', value: aggregates.tax.toFixed(2) },
            { label:'Discount', value: aggregates.discount.toFixed(2) }
          ]}
        />
        <div className='surface-solid border border-token rounded-xl overflow-hidden'>
          {error && (
            <div className='p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800'>
              <p className='text-red-600 dark:text-red-400 text-sm'>{error}</p>
            </div>
          )}
          <table className='w-full text-sm'>
            <thead className='text-left text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 bg-[var(--surface-1)]'>
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
