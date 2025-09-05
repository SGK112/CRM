"use client";

import { Dialog } from '../ui/dialog';
import { useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Props {
  open: boolean;
  onClose: () => void;
  defaultType?: 'client' | 'subcontractor' | 'vendor';
  onCreated?: (created: Record<string, unknown>) => void;
}

export default function CreateContactSlideOver({ open, onClose, defaultType = 'client', onCreated }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
  status: 'lead',
  notes: '',
  type: defaultType,
  // QuickBooks / accounting fields
  quickbooksSync: false,
  quickbooksDisplayName: '',
  quickbooksAccountRef: '',
  // Expenses/invoices tracking (useful for subs/vendors)
  trackExpenses: false,
  defaultExpenseAccount: '',
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Basic validation
    if (!form.firstName || !form.lastName) {
      setError('Please provide first and last name');
      return;
    }
    if (!form.email && form.type === 'client') {
      // Clients should have email for communication; warn but allow different flows
      setError('Clients should include an email address');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        company: form.company,
        status: form.status,
        notes: form.notes,
        type: form.type,
        quickbooks: form.quickbooksSync ? {
          displayName: form.quickbooksDisplayName || `${form.firstName} ${form.lastName}`,
          accountRef: form.quickbooksAccountRef || undefined,
        } : undefined,
        accounting: form.trackExpenses ? {
          defaultExpenseAccount: form.defaultExpenseAccount || undefined,
        } : undefined,
      };

      const resp = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        if (resp.status === 401) {
          setError('You are not signed in. Please sign in to create a contact or use the full "New Client" page.');
        } else {
          const txt = await resp.text();
          setError(`Create failed: ${resp.status} ${txt}`);
        }
        setSaving(false);
        return;
      }

  const data = await resp.json();
  onCreated?.(data as Record<string, unknown>);
      setSaving(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => { if (!v) onClose(); }}>
      <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Contact</h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><XMarkIcon className="h-5 w-5" /></button>
            </div>

            {/* Mobile-first tool card: stacked on small screens, row on larger screens */}
            <div className="mb-4">
              <div className="relative rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-sm p-4 flex flex-col sm:flex-row items-center sm:items-start gap-3">
                <div className="flex-shrink-0 h-12 w-12 rounded-md bg-indigo-600 text-white flex items-center justify-center">
                  <CheckIcon className="h-6 w-6" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white">Contact & Accounting</h4>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">Collect contact details plus QuickBooks and expense settings so this contact can be synced and used for invoices, bills and expense tracking.</p>
                </div>
                <div className="absolute top-3 right-3 bg-white dark:bg-slate-900 px-2 py-0.5 rounded text-xs text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800">New</div>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">First name</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="mt-1 block w-full border rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium">Last name</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="mt-1 block w-full border rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" className="mt-1 block w-full border rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 block w-full border rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Company</label>
            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="mt-1 block w-full border rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700" />
          </div>

          <div>
            <label className="block text-sm font-medium">Account type</label>
            <select aria-label="Account type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'client' | 'subcontractor' | 'vendor' })} className="mt-1 block w-full border rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
              <option value="client">Client</option>
              <option value="subcontractor">Subcontractor</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Status</label>
            <select aria-label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 block w-full border rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
              <option value="lead">Lead</option>
              <option value="prospect">Prospect</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1 block w-full border rounded-md px-3 py-2 h-28" />
          </div>

          {/* QuickBooks / Accounting Options */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">QuickBooks & Accounting</h4>
              <div className="text-xs text-gray-500">Optional</div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.quickbooksSync} onChange={(e) => setForm({ ...form, quickbooksSync: e.target.checked })} />
                <span className="text-sm text-gray-900 dark:text-white">Sync to QuickBooks (when enabled, we'll attempt to create or match a QuickBooks contact)</span>
              </label>

              {form.quickbooksSync && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium">QuickBooks Display Name</label>
                    <input value={form.quickbooksDisplayName} onChange={(e) => setForm({ ...form, quickbooksDisplayName: e.target.value })} className="mt-1 block w-full border rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700" placeholder={`${form.firstName} ${form.lastName}`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">QuickBooks Account Ref (optional)</label>
                    <input value={form.quickbooksAccountRef} onChange={(e) => setForm({ ...form, quickbooksAccountRef: e.target.value })} className="mt-1 block w-full border rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700" placeholder="e.g. Vendor:Subcontractors" />
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.trackExpenses} onChange={(e) => setForm({ ...form, trackExpenses: e.target.checked })} />
                <span className="text-sm">Track expenses & invoices for this contact (recommended for subcontractors/vendors)</span>
              </label>

              {form.trackExpenses && (
                <div>
                  <label className="block text-sm font-medium">Default Expense Account</label>
                  <input value={form.defaultExpenseAccount} onChange={(e) => setForm({ ...form, defaultExpenseAccount: e.target.value })} className="mt-1 block w-full border rounded-md px-3 py-2" placeholder="e.g. Job Materials" />
                  <p className="text-xs text-gray-500 mt-1">This account will be used when creating expense entries for invoices or bills for this contact.</p>
                </div>
              )}
            </div>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="mt-4">
            <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 rounded-b-lg flex items-center justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-amber-600 text-white rounded-md flex items-center gap-2 disabled:opacity-60">
                {saving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <CheckIcon className="h-4 w-4" />}
                Create
              </button>
            </div>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
