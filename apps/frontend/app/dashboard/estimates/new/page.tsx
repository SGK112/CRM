"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';

interface LineItem {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
}

export default function NewEstimatePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [clientName, setClientName] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([{
    id: crypto.randomUUID(),
    name: '',
    quantity: 1,
    unitCost: 0,
  }]);
  const [notes, setNotes] = useState('');

  const addLineItem = () => {
    setLineItems(prev => [...prev, { id: crypto.randomUUID(), name: '', quantity: 1, unitCost: 0 }]);
  };

  const updateLineItem = (id: string, patch: Partial<LineItem>) => {
    setLineItems(prev => prev.map(li => li.id === id ? { ...li, ...patch } : li));
  };

  const removeLineItem = (id: string) => {
    setLineItems(prev => prev.filter(li => li.id !== id));
  };

  const subtotal = lineItems.reduce((sum, li) => sum + (li.quantity * li.unitCost), 0);
  const taxRate = 0.0; // Extend later
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || lineItems.some(li => !li.name)) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      const payload = {
        clientName,
        projectTitle: projectTitle || undefined,
        items: lineItems.map(li => ({ name: li.name, quantity: li.quantity, unitCost: li.unitCost })),
        notes: notes || undefined,
        subtotal,
        total,
        status: 'draft'
      };
      const res = await fetch('/api/estimates/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.estimate || data.id || data._id)) {
        const id = data.estimate?.id || data.estimate?._id || data.id || data._id;
        router.push(`/dashboard/estimates/${id}`);
      } else if (res.status === 401) {
        alert('Unauthorized. Please log in again.');
        router.push('/auth/login');
      } else {
        alert(data.message || data.error || 'Failed to create estimate');
      }
    } catch (err) {
      alert('Network error creating estimate');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/estimates" className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800">
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">New Estimate</h1>
            <p className="text-slate-400 text-sm">Create a draft estimate for a client</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-6">
            <h2 className="text-lg font-semibold mb-2">Client & Project</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Client Name *</label>
                <input
                  className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="John Smith"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Project Title (optional)</label>
                <input
                  className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={projectTitle}
                  onChange={e => setProjectTitle(e.target.value)}
                  placeholder="Kitchen Renovation"
                />
              </div>
            </div>
          </section>

          <section className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Line Items</h2>
              <button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-500 hover:bg-brand-400 rounded-lg text-sm font-medium"
              >
                <PlusIcon className="w-4 h-4" /> Add Item
              </button>
            </div>
            <div className="space-y-4">
              {lineItems.map((li, idx) => (
                <div key={li.id} className="grid grid-cols-12 gap-3 items-start bg-black/40 p-4 rounded-lg border border-slate-800">
                  <div className="col-span-12 md:col-span-5 space-y-1">
                    <label className="text-xs text-slate-400">Item Name *</label>
                    <input
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={li.name}
                      onChange={e => updateLineItem(li.id, { name: e.target.value })}
                      placeholder={`Item ${idx + 1}`}
                      required
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2 space-y-1">
                    <label className="text-xs text-slate-400">Qty</label>
                    <input
                      type="number"
                      min={1}
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={li.quantity}
                      onChange={e => updateLineItem(li.id, { quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2 space-y-1">
                    <label className="text-xs text-slate-400">Unit Cost</label>
                    <input
                      type="number"
                      min={0}
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={li.unitCost}
                      onChange={e => updateLineItem(li.id, { unitCost: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2 flex flex-col gap-1">
                    <label className="text-xs text-slate-400">Amount</label>
                    <div className="text-sm font-medium px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-md">${(li.quantity * li.unitCost).toLocaleString()}</div>
                  </div>
                  <div className="col-span-6 md:col-span-1 flex items-end">
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(li.id)}
                        className="w-full text-xs px-2 py-1.5 rounded-md bg-red-600/10 border border-red-800 text-red-400 hover:bg-red-600/20"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
            <h2 className="text-lg font-semibold">Notes</h2>
            <textarea
              className="w-full min-h-[100px] bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional: include scope details, disclaimers, payment terms..."
            />
          </section>

            <section className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
              <h2 className="text-lg font-semibold">Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Tax</span><span>${taxAmount.toLocaleString()}</span></div>
                <div className="flex justify-between text-base font-semibold pt-2 border-t border-slate-800"><span>Total</span><span>${total.toLocaleString()}</span></div>
              </div>
            </section>

          <div className="flex items-center gap-4 pt-2 pb-12">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-60 disabled:cursor-not-allowed font-medium text-sm"
            >
              {submitting ? 'Creating...' : 'Create Estimate'}
            </button>
            <Link href="/dashboard/estimates" className="text-slate-400 hover:text-slate-200 text-sm">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
