"use client";
import Layout from '../../../../components/Layout';
import PricingSelector from '../../../../components/PricingSelector';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Client { _id:string; firstName:string; lastName:string; company?:string; }
interface Project { _id:string; title:string; clientId?:string; status?:string; }
interface Line { name:string; description?:string; quantity:number; unitPrice:number; taxable:boolean; priceItemId?:string; sku?:string; }

interface SelectedPriceItem {
  _id: string;
  sku: string;
  name: string;
  description?: string;
  baseCost: number;
  defaultMarginPct: number;
  unit: string;
  vendorId?: string;
  tags?: string[];
  quantity: number;
  customPrice?: number;
  customMargin?: number;
}

export default function NewInvoice(){
  const router = useRouter();
  const params = useSearchParams();
  const [clients,setClients]=useState<Client[]>([]);
  const [projects,setProjects]=useState<Project[]>([]);
  const [selectedClientId,setSelectedClientId]=useState<string>('');
  const [selectedProjectId,setSelectedProjectId]=useState<string>('');
  const [selectedPriceItems, setSelectedPriceItems] = useState<SelectedPriceItem[]>([]);
  const [items,setItems]=useState<Line[]>([{ name:'New Item', quantity:1, unitPrice:0, taxable:true }]);
  const [taxRate,setTaxRate]=useState<number>(0);
  const [notes,setNotes]=useState<string>('');
  const [error,setError]=useState<string>('');
  const [loading,setLoading]=useState<boolean>(false);
  const token = (typeof window!=='undefined') ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) : '';

  useEffect(()=>{
    const cid = params?.get('clientId');
    const pid = params?.get('projectId');
    if (cid) setSelectedClientId(cid);
    if (pid) setSelectedProjectId(pid);
  },[params]);

  useEffect(()=>{ (async()=>{
    if(!token) return;
    try{
      const ch = await fetch('/api/clients',{ headers:{ Authorization:`Bearer ${token}` }});
      if(ch.ok){ setClients(await ch.json()); }
      const ph = await fetch('/api/projects',{ headers:{ Authorization:`Bearer ${token}` }});
      if(ph.ok){ setProjects(await ph.json()); }
    }catch(e){ /* ignore */ }
  })(); },[token]);

  const clientProjects = useMemo(()=> projects.filter(p=> p.clientId===selectedClientId),[projects,selectedClientId]);

  // Handle pricing selector changes
  const handlePriceItemSelect = (selectedItem: SelectedPriceItem) => {
    // Convert to line item and add to items
    const sellPrice = selectedItem.customPrice || (selectedItem.baseCost * (1 + (selectedItem.customMargin || selectedItem.defaultMarginPct) / 100));
    const newLineItem: Line = {
      priceItemId: selectedItem._id,
      name: selectedItem.name,
      description: selectedItem.description || '',
      quantity: selectedItem.quantity,
      unitPrice: sellPrice,
      taxable: true,
      sku: selectedItem.sku
    };
    
    setItems([...items, newLineItem]);
    
    // Update selected items for the pricing selector
    setSelectedPriceItems([...selectedPriceItems, selectedItem]);
  };

  function update(i:number, patch:Partial<Line>){ const next=[...items]; next[i] = { ...next[i], ...patch }; setItems(next); }
  function add(){ setItems([...items, { name:'New Item', quantity:1, unitPrice:0, taxable:true }]); }
  function remove(i:number){ if(items.length>1){ setItems(items.filter((_,idx)=> idx!==i)); } }

  const subtotal = items.reduce((s,li)=> s + (li.quantity*li.unitPrice), 0);
  const taxAmount = (taxRate>0) ? subtotal * (taxRate/100) : 0;
  const total = subtotal + taxAmount;

  async function submit(e:React.FormEvent){
    e.preventDefault();
    if(!selectedClientId){ setError('Please select a client'); return; }
    if(!token){ setError('Authentication required'); return; }
    setLoading(true); setError('');
    try{
      const body = { clientId: selectedClientId, projectId: selectedProjectId||undefined, items: items.map(li=>({ name: li.name, description: li.description, quantity: li.quantity, unitPrice: li.unitPrice, taxable: li.taxable })), taxRate, notes };
      const res = await fetch('/api/invoices',{ method:'POST', headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify(body) });
      if(res.ok){ const created=await res.json(); router.push(`/dashboard/invoices/${created._id}`); }
      else { const txt = await res.text(); setError(`Failed to create invoice: ${res.status} ${txt}`); }
    } catch { setError('Failed to create invoice'); } finally { setLoading(false); }
  }

  return (
    <Layout>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-semibold'>New Invoice</h1>
            <p className='text-sm text-[var(--text-dim)]'>Bill your client for work or materials</p>
          </div>
          <button className='pill pill-ghost sm' onClick={()=> router.back()}>Cancel</button>
        </div>
        <form onSubmit={submit} className='space-y-6'>
          {error && <div className='p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700'>{error}</div>}
          <div className='surface-solid p-6'>
            <h2 className='text-lg font-medium mb-4'>Client & Project</h2>
            <div className='grid md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Client *</label>
                <select value={selectedClientId} onChange={e=>{ setSelectedClientId(e.target.value); setSelectedProjectId(''); }} className='input text-sm' required>
                  <option value=''>Choose a client…</option>
                  {clients.map(c=> <option key={c._id} value={c._id}>{c.company? `${c.company} (${c.firstName} ${c.lastName})` : `${c.firstName} ${c.lastName}`}</option>)}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Project (optional)</label>
                <select value={selectedProjectId} onChange={e=> setSelectedProjectId(e.target.value)} className='input text-sm' disabled={!selectedClientId}>
                  <option value=''>No project selected</option>
                  {clientProjects.map(p=> <option key={p._id} value={p._id}>{p.title} {p.status? `(${p.status})`: ''}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className='surface-solid p-6'>
            <h2 className='text-lg font-medium mb-4'>Add from Price List</h2>
            <PricingSelector
              onItemSelect={handlePriceItemSelect}
              selectedItems={selectedPriceItems}
              placeholder="Search and select items from your price lists..."
              showVendorFilter={true}
              className="w-full"
            />
          </div>

          <div className='surface-solid p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-medium'>Line Items</h2>
              <button type='button' onClick={add} className='pill pill-tint-green sm'>Add Custom Item</button>
            </div>
            <div className='space-y-3'>
              {items.map((li,i)=>{
                const lineTotal = li.quantity*li.unitPrice;
                return (
                  <div key={i} className='border border-token rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-3'>
                      <div className='flex items-center gap-2'>
                        <h3 className='font-medium text-sm'>Item {i + 1}</h3>
                        {li.sku && (
                          <span className='text-xs bg-[var(--surface-1)] px-2 py-1 rounded text-[var(--text-faint)]'>
                            SKU: {li.sku}
                          </span>
                        )}
                        {li.priceItemId && (
                          <span className='text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-600 dark:text-blue-300'>
                            From Price List
                          </span>
                        )}
                      </div>
                      <span className='text-sm font-medium text-[var(--accent)]'>
                        ${lineTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-3'>
                      <div className='md:col-span-2'>
                        <label className='block text-sm font-medium mb-1'>Item *</label>
                        <input className='input text-sm' value={li.name} onChange={e=> update(i,{ name:e.target.value })} required />
                      </div>
                      <div>
                        <label className='block text-sm font-medium mb-1'>Qty *</label>
                        <input type='number' className='input text-sm' value={li.quantity} min={0} step={0.01} onChange={e=> update(i,{ quantity: Number(e.target.value) })} required />
                      </div>
                      <div>
                        <label className='block text-sm font-medium mb-1'>Unit ($) *</label>
                        <input type='number' className='input text-sm' value={li.unitPrice} min={0} step={0.01} onChange={e=> update(i,{ unitPrice: Number(e.target.value) })} required />
                      </div>
                      <div className='md:col-span-2'>
                        <label className='block text-sm font-medium mb-1'>Description</label>
                        <input className='input text-sm' value={li.description||''} onChange={e=> update(i,{ description:e.target.value })} />
                      </div>
                      <div className='flex items-center'>
                        <label className='inline-flex items-center gap-2 text-sm'>
                          <input type='checkbox' checked={li.taxable} onChange={e=> update(i,{ taxable:e.target.checked })} />
                          Taxable
                        </label>
                      </div>
                      <div className='flex items-center justify-end'>
                        {items.length>1 && (
                          <button type='button' className='text-red-600 text-xs hover:text-red-800' onClick={()=> remove(i)}>
                            Remove Item
                          </button>
                        )}
                      </div>
                    </div>
                    <div className='mt-2 text-xs text-secondary'>Line Total: ${lineTotal.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className='surface-solid p-6'>
            <h2 className='text-lg font-medium mb-4'>Tax & Notes</h2>
            <div className='grid md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Tax Rate (%)</label>
                <input type='number' className='input text-sm' value={taxRate} min={0} max={100} step={0.1} onChange={e=> setTaxRate(Number(e.target.value))} />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium mb-1'>Notes</label>
                <textarea className='input text-sm' rows={3} value={notes} onChange={e=> setNotes(e.target.value)} />
              </div>
            </div>
          </div>

          <div className='surface-solid p-6'>
            <div className='grid md:grid-cols-2 gap-6'>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className='flex justify-between'><span>Tax</span><span>${taxAmount.toFixed(2)}</span></div>
              </div>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between font-bold text-lg pt-2 border-t border-token'><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>

          <div className='flex items-center justify-end gap-3'>
            <button type='button' className='pill pill-ghost' onClick={()=> router.back()}>Cancel</button>
            <button type='submit' disabled={loading} className='pill pill-tint-green'>{loading? 'Creating…' : `Create Invoice ($${total.toFixed(2)})`}</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
