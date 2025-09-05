'use client';

import AddressInput from '@/components/forms/AddressInput';
import PhoneInput from '@/components/forms/PhoneInput';
import { API_BASE } from '@/lib/api';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface ClientUpdate {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  notes?: string;
  status: string;
  source?: string;
  address?: { street?: string; city?: string; state?: string; zipCode?: string; country?: string };
  tags?: string[];
}

export default function EditClientPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<ClientUpdate | null>(null);
  const [tagInput, setTagInput] = useState('');

  const authHeaders = (): Record<string, string> => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token') || localStorage.getItem('accessToken')
        : null;
    const base: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) base['Authorization'] = `Bearer ${token}`;
    return base;
  };

  const fetchClient = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/clients/${id}`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          company: data.company || '',
          jobTitle: data.jobTitle || '',
          notes: data.notes || '',
          status: data.status || 'active',
          source: data.source || 'other',
          address: data.address || {},
          tags: data.tags || [],
        });
      } else if (res.status === 404) {
        setError('Client not found');
      } else if (res.status === 401) {
        router.push('/auth/login');
      } else {
        setError('Failed to load client');
      }
    } catch (error: unknown) {
      setError('Network error loading client');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  function updateField(name: string, value: string | string[]) {
    setForm(f => (f ? { ...f, [name]: value } : f));
  }

  function addTag() {
    if (!tagInput.trim() || !form) return;
    if (form.tags?.includes(tagInput.trim())) {
      setTagInput('');
      return;
    }
    setForm(f => (f ? { ...f, tags: [...(f.tags || []), tagInput.trim()] } : f));
    setTagInput('');
  }
  function removeTag(tag: string) {
    setForm(f => (f ? { ...f, tags: (f.tags || []).filter(t => t !== tag) } : f));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError('');
    try {
      const body: Record<string, unknown> = { ...form };
      // Remove empty optional fields
      (['phone', 'company', 'jobTitle', 'notes', 'source'] as const).forEach(k => {
        if (!body[k]) delete body[k];
      });
      if (body.address) {
        const has = Object.values(body.address as Record<string, unknown>).some(
          v => typeof v === 'string' && v.trim() !== ''
        );
        if (!has) delete body.address;
      }
      const res = await fetch(`${API_BASE}/clients/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (res.ok) {
        router.push(`/dashboard/clients/${id}`);
      } else {
        const msg = await res.text();
        setError(`Save failed (${res.status}) ${msg}`);
      }
    } catch (error: unknown) {
      setError('Network error saving');
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600" />
      </div>
    );
  if (error && !form)
    return (
      <div className="py-24 text-center">
        <h2 className="text-2xl font-semibold mb-2">{error}</h2>
        <Link href="/dashboard/clients" className="text-blue-600 hover:underline">
          Back to Clients
        </Link>
      </div>
    );
  if (!form) return null;

  return (
    <form onSubmit={save} className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/clients/${id}`} className="text-gray-700 hover:text-gray-700">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-brand-700 dark:text-brand-400">Edit Client</h1>
            <p className="text-sm text-gray-700 mt-1">Update client details and preferences</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/dashboard/clients/${id}`}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            disabled={saving}
            type="submit"
            className="inline-flex items-center px-5 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckIcon className="h-5 w-5 mr-1" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input
              required
              value={form.firstName}
              onChange={e => updateField('firstName', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input
              required
              value={form.lastName}
              onChange={e => updateField('lastName', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => updateField('email', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <PhoneInput
              value={form.phone || ''}
              onChange={value => updateField('phone', value)}
              placeholder="Phone number"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input
              value={form.company || ''}
              onChange={e => updateField('company', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input
              value={form.jobTitle || ''}
              onChange={e => updateField('jobTitle', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={e => updateField('status', e.target.value)}
              className="input"
            >
              {['lead', 'prospect', 'active', 'inactive', 'churned', 'completed'].map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select
              value={form.source || 'other'}
              onChange={e => updateField('source', e.target.value)}
              className="input"
            >
              {[
                'referral',
                'website',
                'social_media',
                'advertisement',
                'cold_outreach',
                'other',
              ].map(s => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Address */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold">Address</h2>
        <AddressInput
          address={form.address || {}}
          onChange={address => setForm(f => (f ? { ...f, address } : null))}
          className=""
          showCoordinates={true}
        />
      </section>

      {/* Notes */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold">Notes</h2>
        <textarea
          rows={4}
          value={form.notes || ''}
          onChange={e => updateField('notes', e.target.value)}
          className="input"
          placeholder="Internal notes about this client..."
        />
      </section>

      {/* Tags */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold">Tags</h2>
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add tag and press Enter"
            className="input flex-1"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.tags?.map(t => (
            <span
              key={t}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                className="ml-2 text-blue-600 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          ))}
          {(!form.tags || form.tags.length === 0) && (
            <span className="text-xs text-gray-700">No tags yet.</span>
          )}
        </div>
      </section>
    </form>
  );
}
