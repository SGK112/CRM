"use client";

import { XMarkIcon } from '@heroicons/react/24/outline';
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
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  });

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  type AddressPayload = {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };

  type CreatePayload = {
    type: EntityType;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: AddressPayload;
    status: 'active' | 'inactive' | 'pending' | 'suspended';
    tags: string[];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) : undefined;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Normalize payload to backend client create; for vendor/subcontractor use a shared shape
  const payload: CreatePayload = {
        type,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email || undefined,
        phone: form.phone || undefined,
        company: form.company || undefined,
        address: {
          street: form.street || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          zipCode: form.zipCode || undefined,
          country: form.country || undefined,
        },
        status: 'active',
        tags: [],
      };

      // Decide endpoint by type
      const endpoint = type === 'client' ? '/api/clients' : type === 'vendor' ? '/api/vendors' : '/api/subcontractors';
      const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`Failed to create ${type}`);
      const data = await res.json();
      onCreated?.({ _id: data._id || data.id || data._doc?._id || 'new', type });
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create record';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h3 className="text-lg font-semibold text-[var(--text)]">Add New</h3>
          <button onClick={onClose} className="p-1 hover:bg-[var(--surface-2)] rounded-lg">
            <XMarkIcon className="h-5 w-5 text-[var(--text-dim)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-3">
              <label className="block text-sm text-[var(--text-dim)] mb-1">Type</label>
              <select name="type" value={type} onChange={(e) => setType(e.target.value as EntityType)} className="w-full input">
                <option value="client">Client</option>
                <option value="subcontractor">Subcontractor</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--text-dim)] mb-1">First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full input" required />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-dim)] mb-1">Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full input" required />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-dim)] mb-1">Company</label>
              <input name="company" value={form.company} onChange={handleChange} className="w-full input" />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-dim)] mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full input" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-dim)] mb-1">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="w-full input" />
            </div>
            <div></div>

            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="block text-sm text-[var(--text-dim)] mb-1">Street</label>
                <input name="street" value={form.street} onChange={handleChange} className="w-full input" />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-dim)] mb-1">City</label>
                <input name="city" value={form.city} onChange={handleChange} className="w-full input" />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-dim)] mb-1">State</label>
                <input name="state" value={form.state} onChange={handleChange} className="w-full input" />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-dim)] mb-1">Zip</label>
                <input name="zipCode" value={form.zipCode} onChange={handleChange} className="w-full input" />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-dim)] mb-1">Country</label>
                <input name="country" value={form.country} onChange={handleChange} className="w-full input" />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="btn btn-gray-outline">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-amber">
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
