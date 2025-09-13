"use client";

import { CheckIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';

type EntityType = 'client' | 'subcontractor' | 'vendor';

interface UnifiedOnboardingModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (entity: { _id: string; type: EntityType }) => void;
}

export default function UnifiedOnboardingModal({ open, onClose, onCreated }: UnifiedOnboardingModalProps) {
  const [type, setType] = useState<EntityType>('client');
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    autoSync: true,
    syncQuickBooks: false,
    syncCalendar: false
  });

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type: inputType } = e.target;
    const inputValue = inputType === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm(prev => ({ ...prev, [name]: inputValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSyncStatus('syncing');
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) : undefined;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = {
        type,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email || undefined,
        phone: form.phone || undefined,
        company: form.company || undefined,
        status: 'active',
        tags: [],
        preferences: {
          autoSync: form.autoSync,
          syncQuickBooks: form.syncQuickBooks,
          syncCalendar: form.syncCalendar
        }
      };

      // Create the contact
      const endpoint = type === 'client' ? '/api/clients' : type === 'vendor' ? '/api/vendors' : '/api/subcontractors';
      const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`Failed to create ${type}`);

      const data = await res.json();
      const contactId = data._id || data.id || data._doc?._id || 'new';

      // Handle sync operations if enabled
      if (form.autoSync && contactId !== 'new') {
        const syncPromises = [];

        if (form.syncQuickBooks) {
          syncPromises.push(
            fetch(`/api/clients/${contactId}/sync-quickbooks`, {
              method: 'POST',
              headers,
            }).catch(() => null)
          );
        }

        if (form.syncCalendar) {
          syncPromises.push(
            fetch(`/api/clients/${contactId}/sync-calendar`, {
              method: 'POST',
              headers,
            }).catch(() => null)
          );
        }

        if (syncPromises.length > 0) {
          await Promise.allSettled(syncPromises);
        }
      }

      setSyncStatus('success');

      setTimeout(() => {
        onCreated?.({ _id: contactId, type });
        onClose();
      }, 1500);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create record';
      setError(message);
      setSyncStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  if (syncStatus === 'syncing') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm mx-4 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CloudArrowUpIcon className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text)] mb-2">Creating & Syncing</h3>
          <p className="text-[var(--text-dim)] mb-4">Setting up your contact and syncing data...</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  if (syncStatus === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm mx-4 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text)] mb-2">Success!</h3>
          <p className="text-[var(--text-dim)]">Contact created and synced successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl mx-4">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h3 className="text-lg font-semibold text-[var(--text)]">Quick Contact Setup</h3>
          <button onClick={onClose} className="p-1 hover:bg-[var(--surface-2)] rounded-lg">
            <XMarkIcon className="h-5 w-5 text-[var(--text-dim)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Contact Type */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Contact Type</label>
            <select
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value as EntityType)}
              className="w-full input"
              required
            >
              <option value="client">👥 Client</option>
              <option value="subcontractor">🔨 Subcontractor</option>
              <option value="vendor">🚚 Vendor</option>
            </select>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">First Name *</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="w-full input"
                required
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">Last Name *</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="w-full input"
                required
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full input"
              required
              placeholder="john@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full input"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">Company</label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                className="w-full input"
                placeholder="ABC Construction"
              />
            </div>
          </div>

          {/* Sync Preferences */}
          <div className="bg-[var(--surface-1)] rounded-lg p-4 border border-[var(--border)]">
            <h4 className="font-medium text-[var(--text)] mb-3">Sync Preferences</h4>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="autoSync"
                  checked={form.autoSync}
                  onChange={handleChange}
                  className="rounded border-[var(--border)] text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="font-medium text-[var(--text)]">Auto Sync</span>
                  <p className="text-sm text-[var(--text-dim)]">Automatically sync data across tools</p>
                </div>
              </label>

              {form.autoSync && (
                <div className="ml-6 space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="syncQuickBooks"
                      checked={form.syncQuickBooks}
                      onChange={handleChange}
                      className="rounded border-[var(--border)] text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-[var(--text)]">💼 QuickBooks</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="syncCalendar"
                      checked={form.syncCalendar}
                      onChange={handleChange}
                      className="rounded border-[var(--border)] text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-[var(--text)]">📅 Calendar</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button type="button" onClick={onClose} className="btn btn-gray-outline">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-amber flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  Create & Sync
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
